// The final screen: nine tap-through Stories (LAUNCH-SPEC section 21). The deck and its screens live in ./stories;
// this wrapper keeps the props PersonaApp already passes.
import React from "react";
import { StoryDeck } from "./stories/StoryDeck.jsx";

export function PersonaResult({ view, friends, onFriendAction, onRestart, onDownload, onDelete, storageOK, start = 0 }) {
  return (
    <StoryDeck stories={view} friends={friends} onFriendAction={onFriendAction} onRestart={onRestart}
      onDownload={onDownload} onDelete={onDelete} storageOK={storageOK} start={start} />
  );
}
