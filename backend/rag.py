"""
RAG Engine with Category-Based Metadata Filtering

CRITICAL FIX FOR GENERIC OUTPUT PROBLEM:
=========================================
The previous RAG system produced generic disease overviews because:
1. Guidelines and disclaimers dominated vector retrieval
2. Disease-specific content was mixed with instructional text
3. FAISS retrieved based on semantic similarity without category awareness

THIS FIX IMPLEMENTS:
1. Separate chunking with metadata (category, disease, hospital)
2. Category-scoped retrieval - disease queries ONLY search disease chunks
3. Disease-specific filtering - hypertension query only retrieves hypertension chunks
4. Fallback messaging when disease data is insufficient

This ensures disease overviews are ALWAYS disease-specific when data exists.
"""

import os
import json
import numpy as np
from typing import List, Dict, Optional, Tuple
from pathlib import Path
from dataclasses import dataclass, asdict

import faiss
from sentence_transformers import SentenceTransformer


@dataclass
class Chunk:
    """
    Represents a text chunk with metadata for filtered retrieval.
    
    Metadata enables scoped searching:
    - category: disease | template | guideline | wellness | disclaimer
    - disease: specific disease name or null
    - hospital_id: tenant isolation
    """
    text: str
    category: str  # disease, template, guideline, wellness, disclaimer
    disease: Optional[str]  # hypertension, diabetes, respiratory_health, or None
    hospital_id: str
    source_file: str
    chunk_index: int


class RAGEngine:
    """
    Retrieval-Augmented Generation engine with category-based filtering.
    
    KEY DESIGN DECISIONS:
    1. Single FAISS index with metadata stored separately
    2. Post-retrieval filtering by category and disease
    3. Strict TOP_K enforcement after filtering
    4. Deterministic retrieval based on document type
    
    WHY THIS AVOIDS GENERIC OUTPUT:
    - Disease overview queries ONLY search disease category chunks
    - Disease name filtering ensures hypertension query returns hypertension content
    - Guidelines/templates are NEVER returned for disease queries
    """
    
    # Category definitions for scoped retrieval
    CATEGORY_DISEASE = "disease"
    CATEGORY_TEMPLATE = "template"
    CATEGORY_GUIDELINE = "guideline"
    CATEGORY_WELLNESS = "wellness"
    CATEGORY_DISCLAIMER = "disclaimer"
    
    def __init__(self):
        self.model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        self.chunk_size = 250  # Target 200-300 words per chunk
        self.top_k = 3  # Maximum chunks to return
        
        # Initialize sentence transformer for embeddings
        print(f"🔄 Loading embedding model: {self.model_name}")
        self.encoder = SentenceTransformer(self.model_name)
        self.embedding_dim = self.encoder.get_sentence_embedding_dimension()
        
        # Storage: index and metadata per hospital
        self.indexes: Dict[str, faiss.IndexFlatIP] = {}
        self.chunks: Dict[str, List[Chunk]] = {}
        
        # Build indexes on startup
        self._initialize_indexes()
    
    def _initialize_indexes(self):
        """Initialize FAISS indexes for all hospitals with data"""
        data_dir = Path(__file__).parent / "data"
        
        if data_dir.exists():
            for hospital_dir in data_dir.iterdir():
                if hospital_dir.is_dir():
                    hospital_id = hospital_dir.name
                    self._build_hospital_index(hospital_id)
    
    def _build_hospital_index(self, hospital_id: str):
        """
        Build FAISS index for a hospital from structured data folders.
        
        Folder structure expected:
        data/{hospital_id}/
          ├── diseases/          -> category: disease
          ├── templates/         -> category: template
          ├── guidelines/        -> category: guideline
          ├── wellness/          -> category: wellness
          └── disclaimers.txt    -> category: disclaimer
        """
        data_dir = Path(__file__).parent / "data" / hospital_id
        indexes_dir = Path(__file__).parent / "indexes"
        indexes_dir.mkdir(exist_ok=True)
        
        index_path = indexes_dir / f"{hospital_id}.index"
        metadata_path = indexes_dir / f"{hospital_id}_metadata.json"
        
        # Check if we can load existing index
        if index_path.exists() and metadata_path.exists():
            if self._load_existing_index(hospital_id, index_path, metadata_path):
                return
        
        print(f"📊 Building index for hospital: {hospital_id}")
        
        all_chunks: List[Chunk] = []
        
        # Process diseases folder
        diseases_dir = data_dir / "diseases"
        if diseases_dir.exists():
            for disease_file in diseases_dir.glob("*.txt"):
                disease_name = disease_file.stem  # e.g., "hypertension"
                chunks = self._process_file(
                    disease_file, 
                    self.CATEGORY_DISEASE, 
                    disease_name, 
                    hospital_id
                )
                all_chunks.extend(chunks)
                print(f"  ✅ Processed disease: {disease_name} ({len(chunks)} chunks)")
        
        # Process templates folder
        templates_dir = data_dir / "templates"
        if templates_dir.exists():
            for template_file in templates_dir.glob("*.txt"):
                chunks = self._process_file(
                    template_file,
                    self.CATEGORY_TEMPLATE,
                    None,
                    hospital_id
                )
                all_chunks.extend(chunks)
                print(f"  ✅ Processed template: {template_file.name} ({len(chunks)} chunks)")
        
        # Process guidelines folder
        guidelines_dir = data_dir / "guidelines"
        if guidelines_dir.exists():
            for guideline_file in guidelines_dir.glob("*.txt"):
                chunks = self._process_file(
                    guideline_file,
                    self.CATEGORY_GUIDELINE,
                    None,
                    hospital_id
                )
                all_chunks.extend(chunks)
                print(f"  ✅ Processed guideline: {guideline_file.name} ({len(chunks)} chunks)")
        
        # Process wellness folder
        wellness_dir = data_dir / "wellness"
        if wellness_dir.exists():
            for wellness_file in wellness_dir.glob("*.txt"):
                chunks = self._process_file(
                    wellness_file,
                    self.CATEGORY_WELLNESS,
                    None,
                    hospital_id
                )
                all_chunks.extend(chunks)
                print(f"  ✅ Processed wellness: {wellness_file.name} ({len(chunks)} chunks)")
        
        # Process disclaimers file
        disclaimers_file = data_dir / "disclaimers.txt"
        if disclaimers_file.exists():
            chunks = self._process_file(
                disclaimers_file,
                self.CATEGORY_DISCLAIMER,
                None,
                hospital_id
            )
            all_chunks.extend(chunks)
            print(f"  ✅ Processed disclaimers ({len(chunks)} chunks)")
        
        if not all_chunks:
            print(f"  ⚠️ No data found for {hospital_id}")
            return
        
        # Create embeddings
        print(f"  🔢 Creating embeddings for {len(all_chunks)} chunks...")
        texts = [chunk.text for chunk in all_chunks]
        embeddings = self.encoder.encode(texts, show_progress_bar=True)
        embeddings = np.array(embeddings).astype('float32')
        
        # Normalize for cosine similarity
        faiss.normalize_L2(embeddings)
        
        # Create FAISS index
        index = faiss.IndexFlatIP(self.embedding_dim)
        index.add(embeddings)
        
        # Save index and metadata
        faiss.write_index(index, str(index_path))
        
        metadata = [asdict(chunk) for chunk in all_chunks]
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        
        # Store in memory
        self.indexes[hospital_id] = index
        self.chunks[hospital_id] = all_chunks
        
        print(f"  ✅ Index built: {len(all_chunks)} total chunks")
        self._print_chunk_summary(all_chunks)
    
    def _load_existing_index(
        self, 
        hospital_id: str, 
        index_path: Path, 
        metadata_path: Path
    ) -> bool:
        """Load existing FAISS index and metadata"""
        try:
            print(f"📂 Loading existing index for {hospital_id}")
            
            self.indexes[hospital_id] = faiss.read_index(str(index_path))
            
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            self.chunks[hospital_id] = [
                Chunk(**item) for item in metadata
            ]
            
            print(f"  ✅ Loaded {len(self.chunks[hospital_id])} chunks")
            return True
            
        except Exception as e:
            print(f"  ⚠️ Failed to load index: {e}")
            return False
    
    def _process_file(
        self,
        file_path: Path,
        category: str,
        disease: Optional[str],
        hospital_id: str
    ) -> List[Chunk]:
        """
        Process a file into chunks with metadata.
        
        Chunking strategy:
        - Split by "---" section markers first
        - Each section becomes one chunk (if under size limit)
        - Large sections split by word count
        - One topic per chunk to avoid mixing content
        """
        content = file_path.read_text(encoding='utf-8')
        chunks = []
        
        # Split by section markers
        sections = content.split('---')
        
        for idx, section in enumerate(sections):
            section = section.strip()
            if not section:
                continue
            
            # Skip metadata headers (first few lines with Category:, Disease:)
            lines = section.split('\n')
            clean_lines = []
            for line in lines:
                line_lower = line.lower().strip()
                if line_lower.startswith('category:') or line_lower.startswith('disease:'):
                    continue
                clean_lines.append(line)
            
            section = '\n'.join(clean_lines).strip()
            if not section:
                continue
            
            words = section.split()
            
            if len(words) <= self.chunk_size:
                # Single chunk
                chunks.append(Chunk(
                    text=section,
                    category=category,
                    disease=disease,
                    hospital_id=hospital_id,
                    source_file=file_path.name,
                    chunk_index=len(chunks)
                ))
            else:
                # Split into smaller chunks
                for i in range(0, len(words), self.chunk_size):
                    chunk_words = words[i:i + self.chunk_size]
                    chunk_text = ' '.join(chunk_words)
                    chunks.append(Chunk(
                        text=chunk_text,
                        category=category,
                        disease=disease,
                        hospital_id=hospital_id,
                        source_file=file_path.name,
                        chunk_index=len(chunks)
                    ))
        
        return chunks
    
    def _print_chunk_summary(self, chunks: List[Chunk]):
        """Print summary of chunks by category"""
        summary = {}
        for chunk in chunks:
            key = f"{chunk.category}"
            if chunk.disease:
                key += f":{chunk.disease}"
            summary[key] = summary.get(key, 0) + 1
        
        print("  📋 Chunk distribution:")
        for key, count in sorted(summary.items()):
            print(f"     - {key}: {count} chunks")
    
    def retrieve(
        self,
        query: str,
        hospital_id: str,
        document_type: str,
        disease_name: Optional[str] = None,
        top_k: Optional[int] = None
    ) -> Tuple[List[str], str]:
        """
        Retrieve relevant chunks with category-based filtering.
        
        SCOPED RETRIEVAL LOGIC (NON-NEGOTIABLE):
        =========================================
        
        IF document_type == "disease_overview":
            - Search ONLY disease category
            - Filter by disease_name if provided
            - Return disease-specific content
        
        IF document_type == "medical_certificate":
            - Search ONLY templates + disclaimers
            - Never include disease content
        
        IF document_type == "health_suggestions" or "educational_notes":
            - Search wellness + guidelines
            - May include general disclaimers
        
        WHY THIS PREVENTS GENERIC OUTPUT:
        - Disease queries never retrieve guidelines
        - Disease name filtering ensures specificity
        - Insufficient data returns clear message instead of generic content
        
        Returns:
            Tuple of (list of chunk texts, retrieval status message)
        """
        k = min(top_k or self.top_k, self.top_k)
        
        # Ensure index exists
        if hospital_id not in self.indexes:
            self._build_hospital_index(hospital_id)
        
        if hospital_id not in self.indexes:
            return ([], "No reference data available for this hospital.")
        
        # Determine which categories to search based on document type
        allowed_categories = self._get_allowed_categories(document_type)
        
        # Get all chunks for this hospital
        all_chunks = self.chunks[hospital_id]
        index = self.indexes[hospital_id]
        
        # Pre-filter chunks by category and disease
        filtered_indices = []
        for idx, chunk in enumerate(all_chunks):
            # Category filter
            if chunk.category not in allowed_categories:
                continue
            
            # Disease filter (only for disease_overview with specific disease)
            if document_type == "disease_overview" and disease_name:
                if chunk.category == self.CATEGORY_DISEASE:
                    # Must match the requested disease
                    if chunk.disease and chunk.disease.lower() != disease_name.lower():
                        continue
            
            filtered_indices.append(idx)
        
        if not filtered_indices:
            if document_type == "disease_overview" and disease_name:
                return ([], f"Insufficient disease-specific reference data available for {disease_name}.")
            return ([], "No matching reference data found for this query type.")
        
        # Encode query
        query_embedding = self.encoder.encode([query])
        query_embedding = np.array(query_embedding).astype('float32')
        faiss.normalize_L2(query_embedding)
        
        # Search full index first, then filter results
        # We search for more than k to ensure we get enough after filtering
        search_k = min(len(all_chunks), k * 10)
        distances, indices = index.search(query_embedding, search_k)
        
        # Filter results to only include allowed chunks
        filtered_results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx in filtered_indices:
                filtered_results.append((dist, idx))
            if len(filtered_results) >= k:
                break
        
        if not filtered_results:
            if document_type == "disease_overview" and disease_name:
                return ([], f"Insufficient disease-specific reference data available for {disease_name}.")
            return ([], "No relevant content found after filtering.")
        
        # Extract chunk texts
        result_texts = []
        for _, idx in filtered_results:
            chunk = all_chunks[idx]
            result_texts.append(chunk.text)
        
        # Build status message
        if document_type == "disease_overview" and disease_name:
            status = f"Retrieved {len(result_texts)} chunks for {disease_name} overview."
        else:
            status = f"Retrieved {len(result_texts)} relevant chunks."
        
        return (result_texts, status)
    
    def _get_allowed_categories(self, document_type: str) -> List[str]:
        """
        Determine which categories to search based on document type.
        
        THIS IS THE KEY TO AVOIDING GENERIC OUTPUT:
        - Disease overview ONLY searches disease chunks
        - This prevents guidelines from polluting disease queries
        """
        document_type = document_type.lower()
        
        if document_type == "disease_overview":
            # CRITICAL: Only search disease category for disease overviews
            # This prevents guidelines from being retrieved
            return [self.CATEGORY_DISEASE]
        
        elif document_type == "medical_certificate":
            # Templates and disclaimers only
            return [self.CATEGORY_TEMPLATE, self.CATEGORY_DISCLAIMER]
        
        elif document_type in ["health_suggestions", "educational_notes"]:
            # Wellness, guidelines, and disclaimers
            return [
                self.CATEGORY_WELLNESS, 
                self.CATEGORY_GUIDELINE, 
                self.CATEGORY_DISCLAIMER
            ]
        
        else:
            # Default: wellness and guidelines (safe content)
            return [self.CATEGORY_WELLNESS, self.CATEGORY_GUIDELINE]
    
    def rebuild_index(self, hospital_id: str):
        """Force rebuild of index for a hospital"""
        indexes_dir = Path(__file__).parent / "indexes"
        
        # Remove existing files
        index_path = indexes_dir / f"{hospital_id}.index"
        metadata_path = indexes_dir / f"{hospital_id}_metadata.json"
        
        if index_path.exists():
            index_path.unlink()
        if metadata_path.exists():
            metadata_path.unlink()
        
        # Remove from memory
        self.indexes.pop(hospital_id, None)
        self.chunks.pop(hospital_id, None)
        
        # Rebuild
        self._build_hospital_index(hospital_id)
    
    def get_available_diseases(self, hospital_id: str) -> List[str]:
        """Get list of diseases with indexed content"""
        if hospital_id not in self.chunks:
            return []
        
        diseases = set()
        for chunk in self.chunks[hospital_id]:
            if chunk.category == self.CATEGORY_DISEASE and chunk.disease:
                diseases.add(chunk.disease)
        
        return sorted(list(diseases))
    
    def get_index_stats(self, hospital_id: str) -> Dict:
        """Get statistics about the index for debugging"""
        if hospital_id not in self.chunks:
            return {"error": "Hospital not indexed"}
        
        chunks = self.chunks[hospital_id]
        
        stats = {
            "total_chunks": len(chunks),
            "by_category": {},
            "diseases": []
        }
        
        for chunk in chunks:
            cat = chunk.category
            stats["by_category"][cat] = stats["by_category"].get(cat, 0) + 1
            
            if chunk.disease and chunk.disease not in stats["diseases"]:
                stats["diseases"].append(chunk.disease)
        
        return stats
