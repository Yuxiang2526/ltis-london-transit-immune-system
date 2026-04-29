import { Link } from "react-router-dom";
import { useLTISDataContext } from "../data/dataContext";

import Hero from "../components/story/Hero";
import ConceptCards from "../components/story/ConceptCards";
import ResearchQuestion from "../components/story/ResearchQuestion";
import StoryScroller from "../features/story/StoryScroller";
import Reveal from "../components/ui/Reveal";

/**
 * The story page (index route). Sequence:
 *   Hero → Concept cards → Research question → Three-act scrollytelling →
 *   CTA into the explorer.
 *
 * Each section below the hero is wrapped in Reveal so it fades in on
 * scroll — small touch, but raises perceived polish significantly.
 */
export default function StoryRoute() {
  const { lsoaData } = useLTISDataContext();

  return (
    <>
      <Hero />

      <Reveal>
        <ConceptCards />
      </Reveal>

      <Reveal>
        <ResearchQuestion />
      </Reveal>

      <StoryScroller data={lsoaData} />

      <Reveal>
        <section className="story-cta">
          <div>
            <p className="eyebrow">Now you've seen the story</p>
            <h2>Run your own scenarios</h2>
            <p className="muted">
              The explorer lets you switch line, switch metric, hover any
              neighbourhood, and inspect its 5-dimension fallback profile.
            </p>
          </div>
          <Link to="/explore" className="hero-cta">
            Open the explorer →
          </Link>
        </section>
      </Reveal>
    </>
  );
}
