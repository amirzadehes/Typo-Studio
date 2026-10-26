import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Typo} from './Comp.jsx';

const FPS = 30;

registerRoot(() => (
  <Composition
    id="Typo"
    component={Typo}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={300}
    defaultProps={{duration: 10, scenes: []}}
    calculateMetadata={({props}) => ({durationInFrames: Math.ceil(props.duration * FPS)})}
  />
));
