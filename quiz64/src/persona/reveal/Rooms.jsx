// Story 6, room by room (round 2): how the player shows up in each room they walked through (love, work and home
// when they opened those doors, then friends, money, phone and play), each line read from that room's own answers.
// Every room floats on its own chapter island; the dots are the same clarity cue as the findings. When a room leans
// the other way from the player's overall map, it says so: that split is real, it came from their answers.
import React from "react";
import { IslandScene } from "../../art/index.js";

function Dots({ level }) {
  return (
    <span className="rv-dots" aria-hidden="true" data-level={level}>
      {[1, 2, 3].map((k) => <i key={k} className={k <= level ? "is-on" : ""} />)}
    </span>
  );
}

export function RoomsScreen({ s }) {
  return (
    <div className="rv-body rv-body--rooms">
      <p className="rv-kicker rv-in">{s.kicker}</p>
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      <ul className="rv-rooms" data-count={s.rows.length}>
        {s.rows.map((r, i) => (
          <li key={r.key} className="rv-roomrow" style={{ "--i": i }} data-chapter={r.chapter} data-differs={r.differs ? "true" : "false"}>
            <span className="rv-roomrow__isle" aria-hidden="true">
              <i className="rv-roomrow__halo" />
              <IslandScene chapter={r.chapter} size={92} />
            </span>
            <span className="rv-roomrow__text">
              <span className="rv-roomrow__head">
                <strong className="rv-roomrow__name">{r.room}</strong>
                {/* G6 (R3): the room's lean as its stat end (src/persona/stats.js) instead of unexplained dots. */}
                {r.leadEnd ? <span className="rv-roomrow__end">{r.leadEnd}</span> : <Dots level={r.level} />}
                {r.differs ? <span className="rv-roomrow__chip">{s.differs}</span> : null}
              </span>
              <span className="rv-roomrow__line">{r.line}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
