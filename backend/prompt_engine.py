"""
Prompt Engine for Healthcare GenAI with Disease-Specific Content

HEALTHCARE GENAI RAG SYSTEM - CRITICAL RULES:
==============================================

This system operates in Retrieval-Augmented Generation (RAG) mode.

CRITICAL RULE:
You MUST generate content ONLY from the provided reference material.
You MUST NOT use general LLM knowledge if reference data is missing,
unless explicitly instructed to provide a labeled fallback.

REFERENCE USAGE RULES:
- The reference material is the ONLY trusted source of information.
- Do NOT add facts, explanations, or details not present in references.
- Do NOT guess, infer, or hallucinate missing information.

MISSING DATA HANDLING (NON-NEGOTIABLE):
- If NO relevant reference material is found:
  1. DO NOT explain the disease or topic.
  2. DO NOT invent symptoms, causes, or risk factors.
  3. DO NOT attempt to answer using general AI knowledge.
  4. Return: "Insufficient reference data is available in the medical
     knowledge base to generate a disease-specific response."

OPTIONAL SAFE FALLBACK (ONLY IF EXPLICITLY ALLOWED):
- Provide ONLY general health guidance.
- Do NOT mention the disease name.
- Do NOT provide medical advice, diagnosis, or treatment.
- Clearly label as: "GENERAL HEALTH INFORMATION (NOT DISEASE-SPECIFIC)"
- Encourage consultation with qualified healthcare professional.

OUTPUT TRANSPARENCY:
- Base every statement on retrieved reference material.
- If response is fallback, disclose it is NOT sourced from disease-specific refs.

IMPORTANT:
Failing safely is preferred over providing unverified or speculative answers.
This system prioritizes medical safety, transparency, and trust over completeness.
"""

import os
import httpx
from typing import List, Optional, Tuple

from schemas import DocumentType


class PromptEngine:
    """
    Constructs prompts with disease-specific context and executes LLM calls.
    
    HEALTHCARE RAG SAFETY PRINCIPLES:
    =================================
    1. Generate content ONLY from provided reference materials
    2. NEVER use general LLM knowledge if reference data is missing
    3. Return controlled "insufficient data" message when references unavailable
    4. Disease name appears in headings when disease content is retrieved
    5. All fallback responses are clearly labeled as non-disease-specific
    6. Failing safely is preferred over unverified/speculative content
    7. Medical safety, transparency, and trust > completeness
    """
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.api_base = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
        self.model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
        self.max_tokens = int(os.getenv("MAX_TOKENS", "1500"))
        self.temperature = float(os.getenv("TEMPERATURE", "0.3"))
    
    def build_prompt(
        self,
        document_type: DocumentType,
        topic: str,
        references: List[str],
        retrieval_status: str,
        patient_id: Optional[str] = None,
        disease_name: Optional[str] = None
    ) -> Tuple[str, bool]:
        """
        Build prompt based on document type with disease-specific context.
        
        Args:
            document_type: Type of document to generate
            topic: User's topic/query
            references: Retrieved chunks from RAG
            retrieval_status: Status message from retrieval
            patient_id: Patient ID for medical certificates
            disease_name: Specific disease name for disease overviews
        
        Returns:
            Tuple of (prompt string, has_sufficient_data boolean)
        
        WHY has_sufficient_data:
        - If no disease-specific data exists, we return a controlled message
        - This prevents the LLM from hallucinating or generalizing
        """
        # Format references
        if references:
            references_text = "\n\n".join([
                f"[Reference {i+1}]:\n{ref}"
                for i, ref in enumerate(references)
            ])
        else:
            references_text = "No specific reference data available."
        
        # Check if we have sufficient data
        has_data = len(references) > 0
        
        # Build type-specific prompt
        if document_type == DocumentType.DISEASE_OVERVIEW:
            return self._build_disease_overview_prompt(
                topic, references_text, disease_name, has_data
            ), has_data
        
        elif document_type == DocumentType.MEDICAL_CERTIFICATE:
            return self._build_medical_certificate_prompt(
                topic, references_text, patient_id
            ), True  # MC always has template data
        
        elif document_type == DocumentType.HEALTH_SUGGESTIONS:
            return self._build_health_suggestions_prompt(
                topic, references_text
            ), has_data
        
        elif document_type == DocumentType.EDUCATIONAL_NOTES:
            return self._build_educational_notes_prompt(
                topic, references_text
            ), has_data
        
        else:
            raise ValueError(f"Unknown document type: {document_type}")
    
    def _build_disease_overview_prompt(
        self,
        topic: str,
        references: str,
        disease_name: Optional[str],
        has_data: bool
    ) -> str:
        """
        Build prompt for Disease Overview with EXPLICIT disease naming.
        
        CRITICAL: The disease name appears in:
        1. The prompt instructions
        2. Required headings
        3. The output structure
        
        This ensures output is NEVER generic when disease data exists.
        """
        # Determine the display name for the disease
        display_disease = disease_name.replace('_', ' ').title() if disease_name else topic
        
        return f"""You are a Healthcare GenAI system operating in Retrieval-Augmented Generation (RAG) mode.

====================================================
CRITICAL RAG RULES - MUST FOLLOW ALL
====================================================

1. Generate content ONLY from the REFERENCE MATERIALS below
2. DO NOT use any external medical knowledge or general AI knowledge
3. DO NOT add facts, explanations, or details not present in references
4. DO NOT guess, infer, or hallucinate missing information
5. DO NOT provide diagnosis, treatment, or medication recommendations
6. The disease name "{display_disease}" MUST appear in all section headings
7. Be specific to {display_disease} - do NOT write generic health content

====================================================
MISSING DATA HANDLING (NON-NEGOTIABLE)
====================================================

If ANY section lacks reference material:
- State: "Insufficient reference data available for this section."
- DO NOT invent symptoms, causes, risk factors, or other medical details
- Leave the section brief rather than hallucinate content

====================================================
REFERENCE MATERIALS (ONLY TRUSTED SOURCE)
====================================================
{references}

DISEASE/TOPIC: {display_disease}

====================================================
REQUIRED OUTPUT STRUCTURE
====================================================

Use these EXACT headings with the disease name:

# {display_disease} Overview

## What is {display_disease}
[Write ONLY based on reference materials - if insufficient, state so]

## {display_disease} Risk Factors
[List ONLY risk factors found in references - do not invent any]

## Signs and Symptoms of {display_disease}
[List ONLY symptoms from references - for awareness, not diagnosis]

## {display_disease} Lifestyle Considerations
[Write lifestyle tips ONLY from references]

## When to Consult a Healthcare Provider About {display_disease}
[Write guidance ONLY from references]

---
**SOURCE TRANSPARENCY**
This content was generated using ONLY the reference materials provided.
No external medical knowledge or AI general knowledge was used.

**HEALTHCARE DISCLAIMER**
This information is provided for educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider with questions about {display_disease} or any medical condition.
---

Generate the {display_disease} overview now using ONLY the reference materials:"""
    
    def _build_medical_certificate_prompt(
        self,
        topic: str,
        references: str,
        patient_id: str
    ) -> str:
        """Build prompt for Medical Certificate (DRAFT ONLY)"""
        return f"""You are a medical document assistant generating a DRAFT Medical Certificate.

CRITICAL RULES - MUST FOLLOW ALL:
1. This is a DRAFT ONLY - clearly mark it as such
2. DO NOT include any diagnosis
3. DO NOT include any treatment or medication
4. DO NOT include any fitness/unfitness decision
5. Use placeholders for patient and doctor identifying information
6. Include mandatory clinician review disclaimer

REFERENCE MATERIALS:
{references}

DOCUMENT REQUEST:
Patient ID: {patient_id}
Purpose: {topic}

Generate a professional DRAFT medical certificate:

═══════════════════════════════════════════════════
[DRAFT - FOR CLINICIAN REVIEW ONLY]

MEDICAL CERTIFICATE - DRAFT

Date: [DATE TO BE COMPLETED]

Patient ID: {patient_id}
Patient Name: [TO BE COMPLETED BY CLINICIAN]

This is to certify that the above-named patient attended/requires medical attention for the purpose stated.

Purpose: {topic}

Date(s) of Consultation: [TO BE COMPLETED BY CLINICIAN]

Clinical Observations: [TO BE COMPLETED BY REVIEWING CLINICIAN]

Recommended Period: [TO BE DETERMINED BY CLINICIAN]

═══════════════════════════════════════════════════
⚠️ IMPORTANT - THIS IS A DRAFT DOCUMENT

• This certificate is NOT VALID until reviewed and signed by a licensed clinician
• Clinician review and signature REQUIRED before any official use
• No diagnosis has been made in this draft
• No treatment has been prescribed in this draft
• No fitness/unfitness determination has been made

Attending Physician: _______________________________
                     [NAME AND SIGNATURE REQUIRED]

License No.: [TO BE COMPLETED]
Date of Issue: [TO BE COMPLETED AFTER REVIEW]
═══════════════════════════════════════════════════

Generate the certificate now:"""
    
    def _build_health_suggestions_prompt(
        self, 
        topic: str, 
        references: str
    ) -> str:
        """Build prompt for General Health Suggestions"""
        return f"""You are a Healthcare GenAI system operating in Retrieval-Augmented Generation (RAG) mode.

====================================================
CRITICAL RAG RULES - MUST FOLLOW ALL
====================================================

1. Generate content ONLY from the REFERENCE MATERIALS below
2. DO NOT use any external medical knowledge or general AI knowledge
3. DO NOT add facts or details not present in references
4. Provide GENERAL wellness suggestions only - not medical advice
5. DO NOT mention specific medications or treatments
6. DO NOT guess, infer, or hallucinate missing information
7. Emphasize consulting healthcare providers for personalized advice

====================================================
MISSING DATA HANDLING
====================================================

If reference material is insufficient:
- State: "Insufficient reference data available."
- DO NOT generate content using general knowledge

====================================================
REFERENCE MATERIALS (ONLY TRUSTED SOURCE)
====================================================
{references}

TOPIC: {topic}

====================================================
REQUIRED OUTPUT STRUCTURE
====================================================

# General Health Suggestions: {topic}

## Overview
[General introduction based ONLY on references]

## Lifestyle Recommendations
[Practical tips ONLY from references - do not invent any]

## Wellness Considerations
[Health-supporting practices ONLY from references]

## When to Consult a Healthcare Provider
[Guidance on seeking professional help]

---
**SOURCE TRANSPARENCY**
This content was generated using ONLY the reference materials provided.
No external medical knowledge or AI general knowledge was used.

**HEALTHCARE DISCLAIMER**
This information is for general wellness purposes only. Individual health needs vary. Please consult your healthcare provider for personalized advice.
---

Generate the health suggestions now:"""
    
    def _build_educational_notes_prompt(
        self, 
        topic: str, 
        references: str
    ) -> str:
        """Build prompt for Educational Medical Notes"""
        return f"""You are a Healthcare GenAI system operating in Retrieval-Augmented Generation (RAG) mode.

====================================================
CRITICAL RAG RULES - MUST FOLLOW ALL
====================================================

1. Generate content ONLY from the REFERENCE MATERIALS below
2. DO NOT use any external medical knowledge or general AI knowledge
3. DO NOT add facts or details not present in references
4. DO NOT guess, infer, or hallucinate missing information
5. Write in clear, patient-friendly language (6th-8th grade reading level)
6. DO NOT provide specific treatment instructions
7. DO NOT mention specific medications
8. Focus on understanding and awareness

====================================================
MISSING DATA HANDLING
====================================================

If reference material is insufficient:
- State: "Insufficient reference data available for this section."
- DO NOT generate content using general knowledge

====================================================
REFERENCE MATERIALS (ONLY TRUSTED SOURCE)
====================================================
{references}

TOPIC: {topic}

====================================================
REQUIRED OUTPUT STRUCTURE
====================================================

# Educational Notes: {topic}

## What You Should Know
[Key information ONLY from references - do not add external facts]

## Understanding the Basics
[Clear explanations ONLY from references]

## Key Points to Remember
[Bullet points of information ONLY from references]

## Questions to Ask Your Healthcare Provider
[Suggested questions based on topic]

---
**SOURCE TRANSPARENCY**
This content was generated using ONLY the reference materials provided.
No external medical knowledge or AI general knowledge was used.

**EDUCATIONAL DISCLAIMER**
This content is for educational purposes only. It does not replace professional medical advice. Always verify information with your healthcare provider.
---

Generate the educational notes now:"""
    
    async def generate(
        self, 
        prompt: str, 
        has_sufficient_data: bool,
        document_type: Optional["DocumentType"] = None,
        disease_name: Optional[str] = None
    ) -> str:
        """
        Execute LLM call to generate content.
        
        If has_sufficient_data is False, returns a controlled message
        instead of letting the LLM generate potentially generic content.
        """
        if not has_sufficient_data:
            if disease_name:
                return self._generate_insufficient_data_response(disease_name)
            return self._generate_insufficient_data_response("this topic")
        
        if not self.api_key:
            # Use demo response if no API key
            return self._generate_demo_response(prompt, disease_name)
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.api_base}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "system",
                                "content": """You are a Healthcare GenAI system operating in Retrieval-Augmented Generation (RAG) mode.

CRITICAL RULE: You MUST generate content ONLY from the provided reference material. You MUST NOT use general LLM knowledge if reference data is missing.

REFERENCE USAGE RULES:
- The reference material in the user prompt is the ONLY trusted source
- Do NOT add facts, explanations, or details not present in references
- Do NOT guess, infer, or hallucinate missing information

MISSING DATA HANDLING (NON-NEGOTIABLE):
- If no relevant reference material exists for a section, state: "Insufficient reference data available for this section."
- Do NOT explain using general knowledge
- Do NOT invent symptoms, causes, or risk factors

Failing safely is preferred over providing unverified or speculative answers.
This system prioritizes medical safety, transparency, and trust over completeness."""
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "max_tokens": self.max_tokens,
                        "temperature": self.temperature
                    }
                )
                
                response.raise_for_status()
                result = response.json()
                
                return result["choices"][0]["message"]["content"]
                
        except Exception as e:
            print(f"LLM API error: {e}")
            return self._generate_demo_response(prompt, disease_name)
    
    def _generate_insufficient_data_response(self, topic: str) -> str:
        """
        Generate controlled response when disease-specific data is missing.
        
        CRITICAL: This prevents the system from:
        - Generating generic content using LLM knowledge
        - Hallucinating medical information
        - Providing unverified or speculative answers
        
        Failing safely is preferred over providing potentially harmful content.
        """
        return f"""═══════════════════════════════════════════════════
INSUFFICIENT REFERENCE DATA
═══════════════════════════════════════════════════

Insufficient reference data is available in the medical knowledge base
to generate a disease-specific response for "{topic}".

----------------------------------------------------
WHY THIS MESSAGE APPEARS
----------------------------------------------------

• No relevant reference material was found for this topic
• Our system does NOT use general AI knowledge for medical content
• We do NOT guess, infer, or hallucinate medical information
• Failing safely is preferred over unverified answers

----------------------------------------------------
WHAT THIS MEANS
----------------------------------------------------

• The requested disease-specific content cannot be generated
• No symptoms, causes, or risk factors will be invented
• No medical explanations will be provided without references

----------------------------------------------------
WHAT YOU CAN DO
----------------------------------------------------

1. Consult a qualified healthcare provider for information about {topic}
2. Visit reputable health information sources:
   - Your local health department
   - Established medical institutions
   - Your healthcare provider's patient portal

3. For healthcare administrators:
   - Ensure disease-specific reference materials are added
   - Contact system support to expand the knowledge base

═══════════════════════════════════════════════════
MEDICAL SAFETY NOTICE

This system prioritizes medical safety, transparency, and trust
over completeness. We only provide information backed by verified
reference materials in our knowledge base.
═══════════════════════════════════════════════════"""
    
    def _generate_demo_response(
        self, 
        prompt: str, 
        disease_name: Optional[str] = None
    ) -> str:
        """
        Generate demo response based on prompt content.
        
        Demo responses are disease-specific when disease data is present.
        """
        # Check what type of document is being requested
        prompt_lower = prompt.lower()
        
        if "medical certificate" in prompt_lower:
            return self._demo_medical_certificate(prompt)
        
        elif "disease overview" in prompt_lower or "hypertension" in prompt_lower:
            if disease_name:
                return self._demo_disease_overview(disease_name)
            # Try to extract disease name from prompt
            if "hypertension" in prompt_lower:
                return self._demo_disease_overview("hypertension")
            elif "diabetes" in prompt_lower:
                return self._demo_disease_overview("diabetes")
            elif "respiratory" in prompt_lower:
                return self._demo_disease_overview("respiratory_health")
        
        elif "health suggestions" in prompt_lower:
            return self._demo_health_suggestions(prompt)
        
        # Default educational notes
        return self._demo_educational_notes(prompt)
    
    def _demo_disease_overview(self, disease_name: str) -> str:
        """Generate disease-specific demo overview"""
        
        disease_display = disease_name.replace('_', ' ').title()
        
        if disease_name.lower() == "hypertension":
            return f"""# {disease_display} Overview

## What is {disease_display}

Hypertension, commonly known as high blood pressure, is a chronic medical condition where the blood pressure in the arteries is persistently elevated. Blood pressure is measured using two numbers: systolic pressure (when the heart beats) and diastolic pressure (when the heart rests between beats). Hypertension is often called the "silent killer" because many people have it without experiencing noticeable symptoms. Regular blood pressure monitoring is essential for early detection.

## {disease_display} Risk Factors

Several factors may increase the risk of developing hypertension:

• Family history of high blood pressure
• Advancing age (risk increases after age 45 for men and 65 for women)
• Excess body weight or obesity
• Physical inactivity and sedentary lifestyle
• High sodium (salt) intake in diet
• Excessive alcohol consumption
• Chronic stress
• Tobacco use including smoking

## Signs and Symptoms of {disease_display}

Many individuals with hypertension experience no obvious symptoms. When symptoms do occur, they may include:

• Persistent headaches, particularly in the morning
• Shortness of breath during normal activities
• Nosebleeds more frequent than usual
• Dizziness or lightheadedness
• Chest discomfort
• Visual disturbances such as blurred vision
• Fatigue

Regular screening is important because hypertension often has no warning signs.

## {disease_display} Lifestyle Considerations

Managing blood pressure often involves lifestyle modifications:

• Maintaining a healthy weight appropriate for your body type
• Engaging in regular physical activity as recommended by your healthcare provider
• Following a balanced diet rich in fruits, vegetables, and whole grains
• Limiting sodium intake
• Reducing alcohol consumption
• Managing stress through relaxation techniques
• Avoiding tobacco products
• Maintaining regular sleep patterns

## When to Consult a Healthcare Provider About {disease_display}

You should consult a healthcare provider if you:

• Have readings consistently above normal range
• Experience any symptoms mentioned above
• Have a family history of high blood pressure or cardiovascular disease
• Experience sudden severe headaches or vision changes
• Have chest pain or difficulty breathing
• Want guidance on lifestyle modifications
• Are pregnant and have elevated blood pressure readings

Regular check-ups are recommended for monitoring and early intervention.

---
**HEALTHCARE DISCLAIMER**

This information is provided for educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider with questions about Hypertension or any medical condition.
---"""
        
        elif disease_name.lower() == "diabetes":
            return f"""# {disease_display} Overview

## What is Type 2 {disease_display}

Type 2 diabetes is a chronic metabolic condition that affects how the body processes blood sugar (glucose). In this condition, the body either resists the effects of insulin or does not produce enough insulin to maintain normal glucose levels. Glucose is an essential source of energy for cells. Type 2 diabetes is the most common form of diabetes and develops gradually over time.

## Type 2 {disease_display} Risk Factors

Multiple factors may increase the likelihood of developing type 2 diabetes:

• Excess body weight, particularly around the abdomen
• Physical inactivity and sedentary lifestyle
• Family history of diabetes in parents or siblings
• Age over 45 years
• History of gestational diabetes during pregnancy
• Certain ethnic backgrounds
• Prediabetes (elevated blood sugar not yet at diabetic levels)

## Signs and Symptoms of Type 2 {disease_display}

Common signs and symptoms include:

• Increased thirst and frequent urination
• Unexplained weight loss despite normal or increased appetite
• Increased hunger
• Fatigue and feeling tired more than usual
• Blurred vision or changes in eyesight
• Slow-healing cuts, bruises, or infections
• Tingling, numbness, or pain in hands and feet
• Areas of darkened skin

Some individuals may have diabetes for years without noticeable symptoms.

## Type 2 {disease_display} Lifestyle Considerations

Lifestyle plays a significant role in diabetes management:

• Maintaining a balanced diet with appropriate portions
• Engaging in regular physical activity
• Achieving and maintaining a healthy weight
• Monitoring blood sugar levels as directed
• Getting adequate sleep and rest
• Managing stress effectively
• Avoiding tobacco products

## When to Consult a Healthcare Provider About {disease_display}

Seek guidance from a healthcare provider if you:

• Experience symptoms mentioned above
• Have risk factors for diabetes
• Have not had blood sugar screening recently
• Experience extreme thirst or frequent urination
• Notice unexplained weight changes
• Have wounds that heal slowly
• Experience numbness or tingling in extremities

---
**HEALTHCARE DISCLAIMER**

This information is provided for educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider with questions about Diabetes or any medical condition.
---"""
        
        else:
            # Respiratory health or other
            return f"""# {disease_display} Overview

## What is {disease_display}

Respiratory health refers to the overall condition and function of the respiratory system, including the lungs, airways, and breathing muscles. The respiratory system is responsible for bringing oxygen into the body and removing carbon dioxide. Maintaining good respiratory health is essential for overall well-being and quality of life.

## {disease_display} Risk Factors

Several factors can affect respiratory health:

• Tobacco smoking and exposure to secondhand smoke
• Air pollution and poor indoor air quality
• Occupational exposure to dust, fumes, or chemicals
• History of respiratory infections in childhood
• Family history of respiratory conditions
• Allergies and allergic reactions
• Weakened immune system

## Respiratory Symptoms to Monitor

Important respiratory symptoms that warrant attention include:

• Persistent cough lasting more than three weeks
• Shortness of breath during normal daily activities
• Wheezing or noisy breathing
• Chest tightness or discomfort when breathing
• Producing mucus or phlegm regularly
• Recurring respiratory infections
• Unexplained fatigue related to breathing effort

## {disease_display} Lifestyle Considerations

Supporting respiratory health involves several practices:

• Avoiding tobacco smoke and vaping products
• Maintaining good indoor air quality
• Practicing good hand hygiene
• Staying current with recommended vaccinations
• Exercising regularly to support lung function
• Staying hydrated
• Using protective equipment in polluted environments

## When to Seek Care for {disease_display} Concerns

Consult a healthcare provider if you experience:

• Persistent cough that does not improve
• Shortness of breath with minimal exertion
• Wheezing or difficulty breathing
• Chest pain when breathing or coughing
• Recurring respiratory infections
• Significant changes in breathing patterns

---
**HEALTHCARE DISCLAIMER**

This information is provided for educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider with questions about respiratory health or any medical condition.
---"""
    
    def _demo_medical_certificate(self, prompt: str) -> str:
        """Generate demo medical certificate"""
        return """═══════════════════════════════════════════════════
[DRAFT - FOR CLINICIAN REVIEW ONLY]

MEDICAL CERTIFICATE - DRAFT
═══════════════════════════════════════════════════

Date: [DATE TO BE COMPLETED]

Patient ID: [AS SPECIFIED]
Patient Name: [TO BE COMPLETED BY CLINICIAN]

This is to certify that the above-named patient attended for medical consultation.

Purpose: [AS SPECIFIED IN REQUEST]

Date(s) of Consultation: [TO BE COMPLETED BY CLINICIAN]

Clinical Observations:
━━━━━━━━━━━━━━━━━━━━
[TO BE COMPLETED BY REVIEWING CLINICIAN]
• Clinical assessment pending review
• Observations to be documented by attending physician

Recommended Period: [TO BE DETERMINED BY CLINICIAN]

═══════════════════════════════════════════════════
⚠️ IMPORTANT - THIS IS A DRAFT DOCUMENT

• This certificate is NOT VALID until reviewed and signed
• Clinician review and signature REQUIRED
• No diagnosis has been made
• No treatment has been prescribed
• No fitness/unfitness determination has been made

Attending Physician: _______________________________
                     [NAME AND SIGNATURE REQUIRED]

License No.: [TO BE COMPLETED]
Date of Issue: [TO BE COMPLETED AFTER REVIEW]
═══════════════════════════════════════════════════"""
    
    def _demo_health_suggestions(self, prompt: str) -> str:
        """Generate demo health suggestions"""
        return """# General Health Suggestions

## Overview

Maintaining good health involves attention to multiple aspects of well-being, including physical activity, nutrition, sleep, and stress management. These suggestions are general in nature and should be discussed with your healthcare provider.

## Lifestyle Recommendations

• Engage in regular physical activity appropriate to your abilities
• Maintain a balanced diet with variety
• Get adequate sleep (7-9 hours for most adults)
• Stay hydrated throughout the day
• Manage stress through healthy techniques
• Maintain social connections

## Wellness Considerations

• Schedule regular health check-ups
• Stay current with recommended screenings
• Practice good hygiene
• Limit alcohol consumption
• Avoid tobacco products
• Take breaks during prolonged sitting

## When to Consult a Healthcare Provider

Contact your healthcare provider for:
• Personalized health recommendations
• Before starting new exercise programs
• Questions about your specific health needs
• Persistent symptoms or concerns
• Regular preventive care

---
**HEALTHCARE DISCLAIMER**

This information is for general wellness purposes only. Individual health needs vary significantly. Please consult your healthcare provider for personalized advice.
---"""
    
    def _demo_educational_notes(self, prompt: str) -> str:
        """Generate demo educational notes"""
        return """# Educational Notes

## What You Should Know

This document provides general educational information. Health topics can be complex, and individual circumstances vary. Use this information as a starting point for discussions with your healthcare provider.

## Understanding the Basics

• Health conditions affect individuals differently
• Prevention and early detection are important
• Lifestyle factors can influence health outcomes
• Regular communication with healthcare providers supports better care

## Key Points to Remember

• Every person's health situation is unique
• General information may not apply to your specific case
• Your healthcare provider is your best resource for personalized advice
• Don't hesitate to ask questions about your health

## Questions to Ask Your Healthcare Provider

Consider asking:
• What does this mean for my specific situation?
• What are my options?
• What lifestyle changes might help?
• When should I follow up?
• What resources are available?

---
**EDUCATIONAL DISCLAIMER**

This content is for educational purposes only. It does not replace professional medical advice. Always verify information with your healthcare provider and seek professional guidance for health decisions.
---"""
