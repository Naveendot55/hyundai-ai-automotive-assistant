/**
 * Intent classifier and prompt builder for Hyundai AI Automotive Assistant
 */

const KNOWN_HYUNDAI_MODELS = [
  { key: 'alcazar', model: 'Hyundai Alcazar' },
  { key: 'creta', model: 'Hyundai Creta' },
  { key: 'i20', model: 'Hyundai i20' },
  { key: 'aura', model: 'Hyundai Aura' },
  { key: 'venue', model: 'Hyundai Venue' },
  { key: 'verna', model: 'Hyundai Verna' },
  { key: 'tucson', model: 'Hyundai Tucson' },
  { key: 'ioniq', model: 'Hyundai Ioniq 5' },
  { key: 'kona', model: 'Hyundai Kona' },
  { key: 'exter', model: 'Hyundai Exter' },
  { key: 'santro', model: 'Hyundai Santro' }
];

const NON_HYUNDAI_MAKES = [
  'jeep', 'honda', 'maruti', 'suzuki', 'toyota', 'tata', 'kia', 
  'mahindra', 'ford', 'skoda', 'volkswagen', 'thar', 'scorpio', 
  'fortuner', 'seltos', 'brezza', 'nexon', 'harrier', 'xuv700'
];

export const detectCapability = (query = '') => {
  const q = query.toLowerCase();

  // Check for non-Hyundai vehicle requests
  for (const make of NON_HYUNDAI_MAKES) {
    // word boundary check
    const regex = new RegExp(`\\b${make}\\b`, 'i');
    if (regex.test(q)) {
      return {
        capability: 'non_hyundai_inquiry',
        isNonHyundai: true,
        make: make.charAt(0).toUpperCase() + make.slice(1),
        targetModels: null,
        title: `${make.toUpperCase()} Inquiry`
      };
    }
  }

  // Capability B: Alcazar vs Creta
  if (
    (q.includes('alcazar') && q.includes('creta')) ||
    (q.includes('compare') && (q.includes('alcazar') && q.includes('creta')))
  ) {
    return {
      capability: 'alcazar_creta_compare',
      targetModels: ['Hyundai Alcazar', 'Hyundai Creta'],
      title: 'Alcazar vs Creta Comparison'
    };
  }

  // Capability D: i20 vs Aura
  if (
    (q.includes('i20') && q.includes('aura')) ||
    (q.includes('recommend') && (q.includes('i20') || q.includes('aura')))
  ) {
    return {
      capability: 'i20_aura_recommend',
      targetModels: ['Hyundai i20', 'Hyundai Aura'],
      title: 'i20 vs Aura Recommendation'
    };
  }

  // Capability C: Alcazar Variant Comparison
  if (
    q.includes('alcazar') &&
    (q.includes('variant') || q.includes('prestige') || q.includes('platinum') || q.includes('signature') || q.includes('trim') || q.includes('difference between models'))
  ) {
    return {
      capability: 'alcazar_variants',
      targetModels: ['Hyundai Alcazar'],
      title: 'Alcazar Variant Comparison'
    };
  }

  // Capability A: Alcazar Features
  if (q.includes('alcazar')) {
    return {
      capability: 'alcazar_features',
      targetModels: ['Hyundai Alcazar'],
      title: 'Hyundai Alcazar Features'
    };
  }

  // Check all known Hyundai vehicle models
  for (const item of KNOWN_HYUNDAI_MODELS) {
    const regex = new RegExp(`\\b${item.key}\\b`, 'i');
    if (regex.test(q)) {
      return {
        capability: 'general_rag',
        targetModels: [item.model],
        requestedModel: item.model,
        title: `${item.model} Inquiry`
      };
    }
  }

  return {
    capability: 'general_rag',
    targetModels: null,
    title: 'Hyundai Automotive Inquiry'
  };
};

/**
 * Builds the strict RAG system prompt based on capability and retrieved chunks
 */
export const buildSystemPrompt = (capability, retrievedChunks) => {
  let capabilityInstructions = '';

  switch (capability) {
    case 'alcazar_features':
      capabilityInstructions = `
You are handling CAPABILITY A: HYUNDAI ALCAZAR FEATURES.
Structure your answer strictly under the following categories (only include categories supported by the retrieved brochure context):
- Engine specifications
- Safety features
- Comfort features
- Technology features
- Interior features
- Exterior features
- Performance
If any category is not mentioned in the retrieved brochure context, explicitly write "Not specified in uploaded brochure".`;
      break;

    case 'alcazar_creta_compare':
      capabilityInstructions = `
You are handling CAPABILITY B: ALCAZAR VS CRETA COMPARISON.
Generate structured comparison tables covering:
- Engine & Transmission
- Performance
- Safety Systems
- Comfort & Convenience
- Technology & Connectivity
- Dimensions & Seating Capacity
- Key Distinctive Features
Retrieve specifications from both vehicle brochures. For any specification not documented in the brochure for either car, explicitly state "Not documented in uploaded brochure".`;
      break;

    case 'alcazar_variants':
      capabilityInstructions = `
You are handling CAPABILITY C: ALCAZAR VARIANT COMPARISON.
Compare the available variants/trims of Hyundai Alcazar (e.g., Prestige, Platinum, Signature or whichever appear in the brochure).
Structure comparisons by:
- Available Variant Names
- Engine & Transmission pairings per variant
- Safety feature distribution across variants
- Interior & Comfort differences
- Technology & Infotainment differences
Use ONLY facts present in the brochure. Clearly distinguish baseline standard features from premium variant exclusives.`;
      break;

    case 'i20_aura_recommend':
      capabilityInstructions = `
You are handling CAPABILITY D: I20 VS AURA RECOMMENDATIONS.
Provide a customer-centric automotive recommendation considering:
- Customer requirements: Budget, City driving vs Highway commuting, Family needs, Comfort, Safety, Performance, Fuel efficiency.
Structure your response as:
1. Head-to-Head Comparison Summary (Markdown Table)
2. Advantages of Hyundai i20 (based on brochure)
3. Advantages of Hyundai Aura (based on brochure)
4. Definite Recommendation tailored to the user's inquiry
5. Justification / Reasons supporting the recommendation
6. Missing / Unconfirmed details if not mentioned in the brochures.`;
      break;

    default:
      capabilityInstructions = `
Provide an accurate, professional Hyundai automotive consultation strictly grounded in the retrieved brochure extracts.`;
  }

  return `You are the official AI Automotive Consultant for Hyundai Motor India.
Your mission is to provide accurate, authoritative, and helpful vehicle guidance to customers.

STRICT RAG GROUNDING RULES:
1. Ground your answer EXCLUSIVELY in the provided "RETRIEVED BROCHURE EXCERPTS".
2. NEVER INVENT, ASSUME, OR EXTRAPOLATE vehicle specifications, power ratings, pricing, fuel efficiency figures, or features.
3. If the retrieved excerpts do not contain the answer or if the requested vehicle brochure is not uploaded, explicitly state: "The uploaded Hyundai brochures do not contain sufficient information to answer this question."
4. Clearly distinguish between confirmed brochure information and unavailable specifications.
5. Reference the source brochure name and page number whenever discussing specific features.
6. Maintain a helpful, courteous, and professional Hyundai automotive tone.

CAPABILITY-SPECIFIC INSTRUCTIONS:
${capabilityInstructions}
`;
};

/**
 * Formats retrieved chunks into readable context blocks
 */
export const formatContextBlocks = (chunks = []) => {
  if (!chunks || chunks.length === 0) {
    return 'NO RELEVANT BROCHURE EXCERPTS FOUND IN DATABASE. Inform the user that brochures need to be uploaded for this vehicle model.';
  }

  return chunks.map((chunk, index) => {
    const docName = chunk.documentName || chunk.metadata?.fileName || 'Hyundai Brochure';
    const page = chunk.pageNumber ? `Page ${chunk.pageNumber}` : 'Page N/A';
    const model = chunk.vehicleModel || 'Hyundai';
    const score = chunk.score ? `(Relevance: ${(chunk.score * 100).toFixed(1)}%)` : '';

    return `--- BROCHURE EXCERPT [${index + 1}] ---
Document: ${docName} | Vehicle: ${model} | ${page} ${score}
Content:
${chunk.content}
`;
  }).join('\n\n');
};
