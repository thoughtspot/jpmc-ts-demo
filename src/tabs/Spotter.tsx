import { SpotterEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { WORKSHEET_ID, SPOTTER_EMBED_FLAGS } from '../config';
import { CONTENT } from '../content';
import { spotterCustomizations } from '../lib/thoughtspot';
import { useTheme } from '../context/ThemeContext';

const Spotter = SpotterEmbed as unknown as (props: any) => JSX.Element;

// Standalone Spotter tab — the plain conversational embed on the model,
// alongside the branded "Ask <aiName>" experience. Ships in the base template
// so a reskin PRUNES it (Ask-AI = fancy-only) rather than having to add it.
export default function SpotterTab() {
  const { theme } = useTheme();
  return (
    <div className="tab-signals">
      <div className="signals-header">
        <h1 className="page-title">{CONTENT.tabs.spotter}</h1>
        <p className="page-subtitle">{CONTENT.spotterSubtitle}</p>
      </div>
      <div className="signals-embed">
        <Spotter
          key={theme}
          worksheetId={WORKSHEET_ID}
          frameParams={{ width: '100%', height: '100%' }}
          customizations={spotterCustomizations(theme)}
          {...SPOTTER_EMBED_FLAGS}
        />
      </div>
    </div>
  );
}
