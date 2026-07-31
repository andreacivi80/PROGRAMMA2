import MixedText from "./MixedText";

export function splitConcepts(text: string) {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [text];
}

export default function ConceptText({ text, terms = [] }: { text: string; terms?: string[] }) {
  return (
    <div className="conceptText">
      {splitConcepts(text).map((sentence, index) => (
        <p key={`${sentence}-${index}`}><MixedText text={sentence} terms={terms} /></p>
      ))}
    </div>
  );
}
