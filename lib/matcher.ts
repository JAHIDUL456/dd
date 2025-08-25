import knowledge from "../data/cv_knowledge.json";

export function findBestResponse(question: string): string {
  const q = question.toLowerCase();

  for (const section in knowledge) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sectionData = (knowledge as any)[section];

    if (typeof sectionData === "object") {
      for (const sub in sectionData) {
        const subData = sectionData[sub];
        if (subData.keywords && subData.keywords.some((kw: string) => q.includes(kw))) {
          const responses: string[] = subData.responses;
          if (section === "conversation" || section === "persona" || section === "personal_details") {
            return responses[Math.floor(Math.random() * responses.length)];
          }
          if (sub === "all") {
            return responses.join("\n");
          }
          return responses[Math.floor(Math.random() * responses.length)];
        }
      }
    }
  }
  const fb = knowledge.fallbacks.unmatched_responses as string[];
  return fb[Math.floor(Math.random() * fb.length)];
}
