import { useId } from "react";
import { colors } from "./data";

const ink = "#51445b";
export function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    play: <path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none" />,
    home: (
      <>
        <path d="m3 11 9-8 9 8M5 10v11h14V10" />
        <path d="M10 21v-7h4v7" />
      </>
    ),
    sound: (
      <>
        <path d="M3 9h4l5-4v14l-5-4H3Z" />
        <path d="M16 8q6 4 0 8M19 5q9 7 0 14" />
      </>
    ),
    mute: (
      <>
        <path d="M3 9h4l5-4v14l-5-4H3Z" />
        <path d="m17 9 5 6m0-6-5 6" />
      </>
    ),
    gear: (
      <>
        <path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h6l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    back: <path d="m10 5-7 7 7 7M4 12h11q6 0 6 7" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 5L20 5" />,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    star: <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" />,
    pause: (
      <>
        <path d="M8 5v14M16 5v14" strokeWidth="5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 2 2 7 7 3-7 2-2 8-3-8-7-2 7-3Z" />
        <path d="m21 1 .5 2 2 .5-2 .5L21 6l-.5-2-2-.5 2-.5Z" />
      </>
    ),
    key: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="4" />
        <path d="M6 8h2m3 0h2m3 0h2M6 12h2m3 0h2m3 0h2M7 16h10" />
      </>
    ),
    heart: <path d="M12 21S1 14 2 7q2-8 10-1 8-7 10 1 1 7-10 14Z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.sparkle}
    </svg>
  );
}
export function Face({
  x = 150,
  y = 130,
  scale = 1,
}: {
  x?: number;
  y?: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="-24" cy="7" rx="12" ry="6" fill="#f59b9c" opacity=".65" />
      <ellipse cx="24" cy="7" rx="12" ry="6" fill="#f59b9c" opacity=".65" />
      <g className="eyes">
        <ellipse cx="-17" cy="0" rx="4.5" ry="6" fill={ink} />
        <ellipse cx="17" cy="0" rx="4.5" ry="6" fill={ink} />
      </g>
      <path
        d="M-7 12Q0 22 8 12"
        fill="none"
        stroke={ink}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </g>
  );
}

export function PancakeDrawing({
  bake = 1,
  face = true,
}: {
  bake?: number;
  face?: boolean;
}) {
  const id = useId();
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop stopColor={bake < 0.2 ? "#fff1be" : "#ffd77d"} />
          <stop
            offset=".75"
            stopColor={
              bake < 0.2 ? "#ffe8b0" : bake > 0.95 ? "#d78a36" : "#eaa543"
            }
          />
          <stop offset="1" stopColor={bake < 0.2 ? "#ffdfa0" : "#bd6f30"} />
        </radialGradient>
      </defs>
      <ellipse
        cx="150"
        cy="169"
        rx="127"
        ry="25"
        fill="#5e4159"
        opacity=".12"
      />
      <ellipse
        cx="150"
        cy="134"
        rx="124"
        ry="61"
        fill="#dc9a4b"
        stroke="#a96337"
        strokeWidth="3"
      />
      <path
        d="M27 127v15c0 36 246 37 246-1v-14"
        fill="#edb15e"
        stroke="#a96337"
        strokeWidth="3"
      />
      <ellipse
        cx="150"
        cy="121"
        rx="124"
        ry="59"
        fill={`url(#${id})`}
        stroke="#b1763e"
        strokeWidth="3"
      />
      <ellipse
        cx="141"
        cy="110"
        rx="101"
        ry="41"
        fill="none"
        stroke="#ffe5a5"
        strokeWidth="3"
        opacity=".75"
      />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <ellipse
          key={i}
          cx={65 + ((i * 43) % 175)}
          cy={92 + ((i * 19) % 53)}
          rx={2 + (i % 3)}
          ry="1.8"
          fill="#b87835"
          opacity={bake * 0.55}
        />
      ))}
      {face && <Face x={150} y={129} scale={0.9} />}
    </g>
  );
}
export function ToppingDrawing({ kind }: { kind: number }) {
  if (kind === 0)
    return (
      <g>
        <path
          d="M-27 8Q-31-4-14-9Q-21-21-4-22Q-9-31 1-42Q0-31 14-26Q29-21 20-10Q40 1 27 10Z"
          fill="#fffdf0"
          stroke="#ddcdb2"
          strokeWidth="2"
        />
        <path
          d="M-19-4Q0 2 20-8M-9-20Q2-13 15-19"
          fill="none"
          stroke="#e7ddc7"
          strokeWidth="2"
        />
      </g>
    );
  if (kind === 1)
    return (
      <g>
        <path
          d="M-20-11Q-31 4 0 28Q30 4 20-11Q9-21 0-12Q-9-21-20-11Z"
          fill="#fa697d"
          stroke="#d54a62"
          strokeWidth="2"
        />
        <path d="m-17-14 11-6 6 5 8-6 11 7-15 5Z" fill="#65b775" />
        {[-1, 0, 1].map((n) => (
          <g key={n} fill="#ffe2b7">
            <ellipse cx={n * 11} cy="0" rx="1.5" ry="2.6" />
            <ellipse cx={n * 6} cy="12" rx="1.5" ry="2.6" />
          </g>
        ))}
      </g>
    );
  if (kind === 2)
    return (
      <g>
        <ellipse
          rx="23"
          ry="16"
          fill="#ffda77"
          stroke="#d8ac4f"
          strokeWidth="2"
        />
        <ellipse rx="17" ry="11" fill="#fff0b1" />
        <path d="m0-6 2 6 6 1-6 2-2 5-2-5-6-2 6-1Z" fill="#ddb96b" />
      </g>
    );
  if (kind === 3)
    return (
      <g>
        {[
          [-11, 0],
          [11, -7],
          [6, 15],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r="12"
              fill="#6d6bab"
              stroke="#4e4e83"
              strokeWidth="2"
            />
            <path
              d={`m${x - 4} ${y - 5} 4 3 4-3-2 5 3 2-5-1-4 1 3-3Z`}
              fill="#9993c4"
            />
          </g>
        ))}
      </g>
    );
  if (kind === 4)
    return (
      <g stroke="#785045" strokeWidth="9" strokeLinecap="round" fill="none">
        <path d="M-70-12Q-35-38 0-10T70-10M-65 13Q-25-9 10 14T65 12" />
      </g>
    );
  return (
    <g>
      {Array.from({ length: 18 }, (_, i) => (
        <rect
          key={i}
          x={-48 + ((i * 29) % 93)}
          y={-20 + ((i * 13) % 43)}
          width="9"
          height="3.5"
          rx="1.7"
          fill={["#ff6688", "#72bda3", "#9b82db", "#ffc44b"][i % 4]}
          transform={`rotate(${i * 33} ${-48 + ((i * 29) % 93)} ${-20 + ((i * 13) % 43)})`}
        />
      ))}
    </g>
  );
}

export function AnimalDrawing({
  kind = 0,
  playing = false,
}: {
  kind?: number;
  playing?: boolean;
}) {
  const c = [
    "#a2bdd1",
    "#c39a78",
    "#d1a273",
    "#8fa4c6",
    "#f2dfd8",
    "#f5b47f",
    "#d5b4e4",
    "#b7d5a0",
    "#b4ccdd",
    "#cdb9dd",
    "#e6c69e",
    "#a6cd91",
  ][kind % 12];
  return (
    <g className={playing ? "animal playing" : "animal"}>
      <ellipse cx="150" cy="210" rx="65" ry="13" fill={ink} opacity=".1" />
      <ellipse cx="150" cy="159" rx="56" ry="57" fill={c} />
      <ellipse cx="115" cy="203" rx="23" ry="12" fill={c} />
      <ellipse cx="185" cy="203" rx="23" ry="12" fill={c} />
      {kind % 5 === 4 ? (
        <>
          <ellipse
            cx="125"
            cy="45"
            rx="19"
            ry="48"
            fill={c}
            transform="rotate(-15 125 45)"
          />
          <ellipse
            cx="178"
            cy="45"
            rx="19"
            ry="48"
            fill={c}
            transform="rotate(15 178 45)"
          />
          <ellipse cx="125" cy="43" rx="9" ry="30" fill="#f2b4b7" />
          <ellipse cx="177" cy="43" rx="9" ry="30" fill="#f2b4b7" />
        </>
      ) : kind % 5 === 2 ? (
        <>
          <ellipse cx="92" cy="93" rx="27" ry="33" fill={c} />
          <ellipse cx="208" cy="93" rx="27" ry="33" fill={c} />
          <ellipse cx="92" cy="93" rx="16" ry="21" fill="#f1ccaa" />
          <ellipse cx="208" cy="93" rx="16" ry="21" fill="#f1ccaa" />
        </>
      ) : kind % 5 === 0 ? (
        <>
          <ellipse cx="91" cy="106" rx="42" ry="47" fill={c} />
          <ellipse cx="209" cy="106" rx="42" ry="47" fill={c} />
          <ellipse cx="91" cy="106" rx="29" ry="31" fill="#d6dce8" />
          <ellipse cx="209" cy="106" rx="29" ry="31" fill="#d6dce8" />
        </>
      ) : (
        <>
          <circle cx="111" cy="64" r="24" fill={c} />
          <circle cx="189" cy="64" r="24" fill={c} />
          <circle cx="111" cy="64" r="13" fill="#f2c9be" />
          <circle cx="189" cy="64" r="13" fill="#f2c9be" />
        </>
      )}
      <ellipse cx="150" cy="108" rx="61" ry="58" fill={c} />
      {kind % 5 === 3 && (
        <ellipse cx="150" cy="130" rx="39" ry="40" fill="#fff7e6" />
      )}
      <Face x={150} y={106} scale={0.85} />
      {kind % 5 === 0 && (
        <path
          d="M144 119Q131 167 160 172Q176 171 178 158"
          fill="none"
          stroke={c}
          strokeWidth="22"
          strokeLinecap="round"
        />
      )}
      <ellipse cx="150" cy="168" rx="28" ry="29" fill="#fff3df" opacity=".55" />
    </g>
  );
}

export function CarDrawing({
  kind = 0,
  color = "#f47a72",
  sticker = 0,
}: {
  kind?: number;
  color?: string;
  sticker?: number;
}) {
  return (
    <g>
      <ellipse cx="150" cy="199" rx="131" ry="13" fill={ink} opacity=".12" />
      <rect
        x="27"
        y="99"
        width="173"
        height="79"
        rx="13"
        fill={color}
        stroke={ink}
        strokeWidth="3"
      />
      {kind === 1 ? (
        <>
          <rect
            x="162"
            y="76"
            width="73"
            height="94"
            rx="12"
            fill={color}
            stroke={ink}
            strokeWidth="3"
          />
          <path
            d="m64 99 18-52 40-8 49 43"
            fill="none"
            stroke="#e9a33f"
            strokeWidth="17"
            strokeLinecap="round"
          />
          <path
            d="m57 89-27 19 12 22 27-20Z"
            fill="#e9a33f"
            stroke={ink}
            strokeWidth="3"
          />
        </>
      ) : (
        <path
          d="M185 81h45q11 0 17 12l23 46v36H181Z"
          fill={color}
          stroke={ink}
          strokeWidth="3"
        />
      )}
      <path
        d={kind === 1 ? "M176 89h46v40h-46Z" : "M197 93h28l20 34h-48Z"}
        fill="#d9f5f7"
        stroke={ink}
        strokeWidth="3"
      />
      <path
        d="m204 98 15 0m-15 8h23"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {kind === 0 ? (
        <>
          <rect
            x="40"
            y="80"
            width="141"
            height="12"
            rx="5"
            fill="#fff5d7"
            stroke={ink}
            strokeWidth="2"
          />
          <path
            d="M58 80v12m24-12v12m24-12v12m24-12v12m24-12v12"
            stroke={ink}
            strokeWidth="2"
          />
          <rect x="196" y="70" width="25" height="10" rx="4" fill="#8dcbeb" />
          <circle cx="115" cy="139" r="22" fill="#fff3dc" />
          <path d="M101 139h28m-14-14v28" stroke={color} strokeWidth="7" />
        </>
      ) : kind === 2 ? (
        <>
          <path d="M36 97h146V79H36Z" fill="#fff5dd" />
          <path
            d="M41 81h20v16H41Zm40 0h20v16H81Zm40 0h20v16h-20Z"
            fill="#ee8ba9"
          />
          <path d="m96 42 16 30 16-30Z" fill="#e0a96b" />
          <circle cx="112" cy="35" r="20" fill="#ffbbd0" />
        </>
      ) : (
        <rect x="68" y="130" width="65" height="23" rx="7" fill="#fff0c4" />
      )}
      {[75, 224].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy="177" r="25" fill={ink} />
          <circle cx={x} cy="177" r="14" fill="#eae3dc" />
          <circle cx={x} cy="177" r="5" fill="#b3a6b4" />
        </g>
      ))}
      <rect x="252" y="142" width="17" height="11" rx="4" fill="#ffe68d" />
      {sticker > 0 && (
        <g transform="translate(149 133) scale(.7)">
          <Star fill={["#ffdd50", "#a4e1c6", "#fff0e5"][sticker % 3]} />
        </g>
      )}
    </g>
  );
}
export function Star({ fill = "#ffce55" }: { fill?: string }) {
  return (
    <path
      d="m0-22 7 14 16 2-12 11 3 16L0 14l-14 7 3-16-12-11 16-2Z"
      fill={fill}
      stroke={ink}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  );
}

export function DinosaurDrawing({
  kind = 0,
  bones = false,
}: {
  kind?: number;
  bones?: boolean;
}) {
  const c = bones ? "#fff7df" : ["#99c99a", "#b3b5e4", "#f0bf82"][kind % 3];
  return (
    <g>
      <ellipse cx="150" cy="210" rx="116" ry="12" fill={ink} opacity=".1" />
      <path
        d="M85 145Q34 169 20 123Q20 169 89 177"
        fill={c}
        stroke={ink}
        strokeWidth="3"
      />
      <ellipse
        cx="139"
        cy="147"
        rx="73"
        ry="43"
        fill={c}
        stroke={ink}
        strokeWidth="3"
      />
      {kind === 2 ? (
        <path
          d="M182 144Q179 85 188 41Q194 15 222 26Q247 38 223 61Q210 64 208 143"
          fill={c}
          stroke={ink}
          strokeWidth="3"
        />
      ) : (
        <>
          <ellipse
            cx="223"
            cy="117"
            rx="49"
            ry="33"
            fill={c}
            stroke={ink}
            strokeWidth="3"
          />
          {kind === 0 ? (
            <>
              <path
                d="m186 96-14-33 33 16 7-27 19 31 22-18-1 35"
                fill="#80b587"
                stroke={ink}
                strokeWidth="3"
              />
              <path
                d="m248 105 20-18-3 25m-34-18 7-28 8 29"
                fill="#fff2d4"
                stroke={ink}
                strokeWidth="2"
              />
            </>
          ) : (
            <>
              {[83, 111, 139, 167].map((x, i) => (
                <path
                  key={i}
                  d={`M${x} 116l10-33 18 27`}
                  fill="#d58fba"
                  stroke={ink}
                  strokeWidth="2"
                />
              ))}
            </>
          )}
        </>
      )}
      {[100, 163].map((x) => (
        <path
          key={x}
          d={`M${x} 171v26q0 13 25 5v-31`}
          fill={c}
          stroke={ink}
          strokeWidth="3"
        />
      ))}
      {!bones && (
        <Face
          x={kind === 2 ? 213 : 238}
          y={kind === 2 ? 43 : 112}
          scale={0.55}
        />
      )}{" "}
      {bones && (
        <g stroke="#bba989" strokeWidth="5" fill="none">
          <path d="M83 148h103M116 124v40m25-45v45m24-39v35" />
          <path d="M108 143v32m54-33v35" />
        </g>
      )}
    </g>
  );
}

export type Look = {
  eyes: number;
  mouth: number;
  horns: number;
  hair: number;
  outfit: number;
  pattern: number;
  color: number;
};
export const defaultLook: Look = {
  eyes: 0,
  mouth: 0,
  horns: 0,
  hair: 0,
  outfit: 0,
  pattern: 0,
  color: 0,
};
export function MonsterDrawing({ look = defaultLook }: { look?: Look }) {
  const c = colors[look.color];
  return (
    <g>
      <ellipse cx="150" cy="216" rx="83" ry="14" fill={ink} opacity=".12" />
      <path
        d="M78 163 53 143M220 161l25-22"
        stroke={c}
        strokeWidth="24"
        strokeLinecap="round"
      />
      <path
        d="M112 185v25m77-25v25"
        stroke={c}
        strokeWidth="28"
        strokeLinecap="round"
      />
      <rect
        x="70"
        y="55"
        width="160"
        height="151"
        rx="68"
        fill={c}
        stroke={ink}
        strokeWidth="3"
      />
      {look.pattern > 0 &&
        Array.from({ length: 11 }, (_, i) => (
          <circle
            key={i}
            cx={87 + ((i * 39) % 124)}
            cy={85 + ((i * 31) % 105)}
            r={look.pattern === 2 ? 6 : 3}
            fill="#fff9e9"
            opacity=".6"
          />
        ))}
      {look.outfit > 0 && (
        <path
          d="M74 151Q150 171 226 151v34q-8 25-76 22-67 2-76-22Z"
          fill={["", "#80b6d7", "#fff0bc", "#b09ce4"][look.outfit]}
          stroke={ink}
          strokeWidth="2"
        />
      )}
      {look.horns > 0 && (
        <>
          <path
            d={
              look.horns === 2
                ? "M93 66Q45 13 102 30Q128 38 100 49"
                : "M91 68 92 18 120 58"
            }
            fill="#ffe38e"
            stroke={ink}
            strokeWidth="3"
          />
          <path
            d="m181 58 27-40 2 50"
            fill="#ffe38e"
            stroke={ink}
            strokeWidth="3"
          />
        </>
      )}
      {look.hair > 0 && (
        <path
          d={
            look.hair === 1
              ? "M88 62Q68 37 92 31Q93 5 120 20Q144-2 160 20Q195 0 204 31Q231 32 214 65Z"
              : look.hair === 2
                ? "M96 58Q113 0 155 21Q190 27 161 50Q142 61 135 40"
                : "M90 59Q150-17 212 59L194 64Q150 18 110 66Z"
          }
          fill={look.hair === 3 ? "#ffce5b" : "#fff1e8"}
          stroke={ink}
          strokeWidth="3"
        />
      )}
      <g fill={ink}>
        {look.eyes === 1 ? (
          <>
            {[118, 150, 182].map((x) => (
              <g key={x}>
                <circle cx={x} cy="104" r="15" fill="white" />
                <ellipse cx={x} cy="105" rx="5" ry="8" />
              </g>
            ))}
          </>
        ) : look.eyes === 2 ? (
          <path
            d="M106 108q15-15 29 0m30 0q15-15 29 0"
            fill="none"
            stroke={ink}
            strokeWidth="5"
            strokeLinecap="round"
          />
        ) : (
          <>
            {[121, 180].map((x) => (
              <g key={x}>
                <circle cx={x} cy="104" r="19" fill="white" />
                {look.eyes === 3 ? (
                  <g transform={`translate(${x} 104) scale(.4)`}>
                    <Star fill={ink} />
                  </g>
                ) : (
                  <ellipse cx={x} cy="106" rx="6" ry="9" />
                )}
              </g>
            ))}
          </>
        )}
      </g>
      <ellipse cx="95" cy="127" rx="13" ry="7" fill="#f0789c" opacity=".6" />
      <ellipse cx="205" cy="127" rx="13" ry="7" fill="#f0789c" opacity=".6" />
      {look.mouth === 1 ? (
        <ellipse cx="150" cy="140" rx="12" ry="16" fill={ink} />
      ) : look.mouth === 2 ? (
        <path
          d="M131 136q8 12 17 0 8 12 18 0"
          fill="none"
          stroke={ink}
          strokeWidth="4"
        />
      ) : (
        <>
          <path d="M128 132Q150 164 173 132Z" fill={ink} />
          {look.mouth === 3 && <path d="m139 135 6 11 7-11Z" fill="white" />}
        </>
      )}
    </g>
  );
}

export function PlanetDrawing({
  kind = 0,
  visited = false,
}: {
  kind?: number;
  visited?: boolean;
}) {
  const c = ["#f2b2ce", "#a4d5de", "#f0d786"][kind];
  return (
    <g>
      <ellipse
        cx="150"
        cy="141"
        rx="113"
        ry="27"
        transform="rotate(-14 150 141)"
        fill="none"
        stroke="#fff1d9"
        strokeWidth="15"
        opacity=".7"
      />
      <circle cx="150" cy="127" r="75" fill={c} stroke={ink} strokeWidth="3" />
      <circle cx="121" cy="157" r="13" fill="white" opacity=".2" />
      <circle cx="186" cy="137" r="20" fill="white" opacity=".2" />
      {kind === 0 ? (
        <g transform="translate(150 90)">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse
              key={i}
              cx="0"
              cy={visited ? -35 : -13}
              rx={visited ? 18 : 13}
              ry="30"
              fill="#fa91ae"
              stroke={ink}
              strokeWidth="2"
              transform={`rotate(${i * 60})`}
            />
          ))}
          <circle r="25" fill="#ffdf7d" />
          <Face x={0} y={0} scale={0.45} />
        </g>
      ) : kind === 1 ? (
        <>
          <path
            d="M88 90Q75 58 108 52Q110 20 145 37Q175 18 189 48Q228 47 213 88Z"
            fill="#fff8eb"
            stroke={ink}
            strokeWidth="3"
          />
          <Face x={150} y={74} scale={0.75} />
        </>
      ) : (
        <>
          <path
            d="M114 102v-46l57-11v42M114 65l57-11"
            fill="none"
            stroke={ink}
            strokeWidth="10"
            strokeLinecap="round"
          />
          <ellipse cx="102" cy="108" rx="17" ry="13" fill={ink} />
          <ellipse cx="159" cy="94" rx="17" ry="13" fill={ink} />
          <Face x={150} y={151} scale={0.7} />
        </>
      )}
    </g>
  );
}
export function ShipDrawing() {
  return (
    <g>
      <ellipse
        cx="150"
        cy="160"
        rx="85"
        ry="18"
        fill="#a4dbdf"
        stroke={ink}
        strokeWidth="3"
      />
      <path
        d="M99 147Q96 69 150 57Q205 70 201 147Z"
        fill="#ffdf84"
        stroke={ink}
        strokeWidth="3"
      />
      <ellipse
        cx="150"
        cy="107"
        rx="29"
        ry="30"
        fill="#d8f6f6"
        stroke={ink}
        strokeWidth="3"
      />
      <Face x={150} y={104} scale={0.6} />
      <path d="m104 174 11 21 13-21m44 0 13 21 11-21" fill="#fba49d" />
      <path d="M91 151h118" stroke="#fff6d9" strokeWidth="5" />
    </g>
  );
}

export function PlantDrawing({
  seed = 0,
  stage = 3,
  variant = "sun",
}: {
  seed?: number;
  stage?: number;
  variant?: string | null;
}) {
  const green = "#78b38a",
    v = variant || "sun",
    petal =
      v === "water"
        ? "#8acde0"
        : v === "magic"
          ? "#bda1e7"
          : v === "rainbow"
            ? "#f2a7c4"
            : "#ffce68";
  return (
    <g>
      <ellipse cx="150" cy="215" rx="71" ry="12" fill={ink} opacity=".1" />
      <path
        d="m89 166 16 51h88l17-51"
        fill="#eaa28a"
        stroke={ink}
        strokeWidth="3"
      />
      <rect
        x="82"
        y="156"
        width="135"
        height="21"
        rx="7"
        fill="#f8b9a0"
        stroke={ink}
        strokeWidth="3"
      />
      {stage > 0 && (
        <>
          <path
            d={`M150 158V${stage === 1 ? 126 : stage === 2 ? 91 : 65}`}
            stroke={green}
            strokeWidth={seed === 1 ? 17 : 9}
            strokeLinecap="round"
          />
          <path
            d="M149 140Q107 143 111 115Q143 110 149 140M152 127Q190 132 188 105Q161 106 152 127"
            fill={green}
          />
        </>
      )}
      {stage > 1 &&
        (seed === 2 ? (
          <>
            <path d="M150 155V106" stroke="#e9d7af" strokeWidth="27" />
            <path
              d="M78 107Q91 36 150 41Q208 35 224 107Z"
              fill={petal}
              stroke={ink}
              strokeWidth="3"
            />
            {[105, 145, 186].map((x, i) => (
              <circle
                key={i}
                cx={x}
                cy={84 - (i % 2) * 19}
                r="11"
                fill="#fff6de"
              />
            ))}
          </>
        ) : seed === 1 ? (
          <>
            <circle
              cx="116"
              cy="84"
              r="39"
              fill={stage === 2 ? green : petal}
            />
            <circle
              cx="166"
              cy="63"
              r="46"
              fill={stage === 2 ? green : petal}
            />
            <circle
              cx="194"
              cy="101"
              r="35"
              fill={stage === 2 ? green : petal}
            />
            {stage === 3 &&
              [116, 158, 195].map((x, i) => (
                <g
                  key={i}
                  transform={`translate(${x} ${82 + (i % 2) * 18}) scale(.45)`}
                >
                  {v === "magic" ? (
                    <Star />
                  ) : (
                    <circle
                      r="17"
                      fill={["#fff6d8", "#fa9f9a", "#b4e5d9"][i]}
                    />
                  )}
                </g>
              ))}
          </>
        ) : (
          <g transform="translate(150 73)">
            {Array.from({ length: stage === 2 ? 4 : 7 }, (_, i) => (
              <ellipse
                key={i}
                cx="0"
                cy="-29"
                rx="20"
                ry="34"
                fill={v === "rainbow" ? colors[i % 5] : petal}
                stroke={ink}
                strokeWidth="1.5"
                transform={`rotate(${i * (stage === 2 ? 90 : 360 / 7)})`}
              />
            ))}
            <circle r="25" fill="#fff0ac" />
            <Face x={0} y={0} scale={0.45} />
          </g>
        ))}
      {stage === 0 && (
        <ellipse cx="150" cy="155" rx="10" ry="6" fill="#976b50" />
      )}
    </g>
  );
}

export function BuildingDrawing({
  kind = 2,
  variant = 0,
}: {
  kind?: number;
  variant?: number;
}) {
  if (kind === 3)
    return (
      <g>
        <rect x="140" y="105" width="20" height="105" rx="7" fill="#b98866" />
        <circle cx="150" cy="85" r="66" fill="#8cc49a" />
        <circle cx="115" cy="122" r="39" fill="#8cc49a" />
        <circle cx="191" cy="119" r="36" fill="#8cc49a" />
        <path
          d="M121 65q14-15 30-14"
          stroke="#b6deb0"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>
    );
  if (kind === 5)
    return (
      <g>
        <ellipse cx="150" cy="159" rx="122" ry="55" fill="#a9dba4" />
        <ellipse
          cx="150"
          cy="154"
          rx="104"
          ry="43"
          fill="#8dcedd"
          stroke="#6ca9bf"
          strokeWidth="3"
        />
        <path
          d="M85 154q20-10 40 0m31 17q19-9 39 0"
          stroke="#d3eff0"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <ellipse cx="173" cy="135" rx="20" ry="13" fill="#ffe6a2" />
        <circle cx="189" cy="121" r="12" fill="#ffe6a2" />
        <path d="m198 119 10 4-10 5" fill="#e79d63" />
      </g>
    );
  const c =
    kind === 4
      ? "#f2a2ae"
      : kind === 7
        ? "#98b9d5"
        : ["#f5cc80", "#b6b4e5", "#a0d2bd"][variant % 3];
  return (
    <g>
      <rect
        x="67"
        y="81"
        width="166"
        height="123"
        rx="9"
        fill={c}
        stroke={ink}
        strokeWidth="3"
      />
      <path
        d="m49 87 101-68 101 68Z"
        fill={kind === 4 ? "#e78694" : "#e8a081"}
        stroke={ink}
        strokeWidth="3"
      />
      {kind === 7 ? (
        <>
          <rect
            x="93"
            y="122"
            width="113"
            height="82"
            rx="9"
            fill="#fff4da"
            stroke={ink}
            strokeWidth="3"
          />
          <path
            d="M94 141h111m-111 21h111m-111 21h111"
            stroke="#cdbfae"
            strokeWidth="3"
          />
        </>
      ) : (
        <>
          <rect
            x="137"
            y="139"
            width="38"
            height="65"
            rx="8"
            fill="#fff4da"
            stroke={ink}
            strokeWidth="3"
          />
          <circle cx="166" cy="173" r="3" fill={ink} />
          {[85, 187].map((x) => (
            <g key={x}>
              <rect
                x={x}
                y="108"
                width="28"
                height="32"
                rx="5"
                fill="#ecf5ee"
                stroke={ink}
                strokeWidth="2"
              />
              <path d={`M${x + 14} 109v30`} stroke={ink} strokeWidth="2" />
            </g>
          ))}
        </>
      )}
      {kind === 4 && (
        <>
          <path d="M66 103h168v24H66Z" fill="#fff6dc" />
          {[70, 112, 154, 196].map((x) => (
            <rect key={x} x={x} y="103" width="20" height="24" fill="#e6818f" />
          ))}
          <ellipse
            cx="151"
            cy="70"
            rx="31"
            ry="14"
            fill="#f8db9b"
            stroke={ink}
            strokeWidth="2"
          />
          <path
            d="m139 61-2 10m16-13-2 11m17-9-2 9"
            stroke="#d4a65c"
            strokeWidth="3"
          />
        </>
      )}
    </g>
  );
}

export function FishDrawing({ kind = 0 }: { kind?: number }) {
  if (kind === 6)
    return (
      <g>
        <path
          d="M104 67h70v87h47q26 0 27 32v18H93V67Z"
          fill="#e9ba7d"
          stroke={ink}
          strokeWidth="4"
        />
        <path d="M93 73h89" stroke="#f8dc9a" strokeWidth="14" />
        <path d="M135 57V21" stroke="#74b189" strokeWidth="7" />
        <g transform="translate(135 27) scale(.6)">
          <Star fill="#f3a4bc" />
        </g>
      </g>
    );
  if (kind === 7)
    return (
      <g>
        <path
          d="M65 110q0-62 85-62t85 62v89H65Z"
          fill="#dda476"
          stroke={ink}
          strokeWidth="4"
        />
        <path
          d="M65 113h170v22H65Z"
          fill="#ffdc80"
          stroke={ink}
          strokeWidth="3"
        />
        <path d="M92 73v126m115-126v126" stroke="#ffdc80" strokeWidth="13" />
        <rect
          x="137"
          y="112"
          width="28"
          height="37"
          rx="7"
          fill="#ffdc80"
          stroke={ink}
          strokeWidth="3"
        />
      </g>
    );
  const c = ["#f2ba68", "#91c7da", "#c9b4e5", "#f4a3ba", "#9bcea3", "#f0cd77"][
    kind
  ];
  return (
    <g>
      <path d="m88 117-56-37v83l56-28Z" fill={c} stroke={ink} strokeWidth="3" />
      <ellipse
        cx="160"
        cy="125"
        rx={kind === 2 ? 70 : 83}
        ry={kind === 2 ? 71 : 55}
        fill={c}
        stroke={ink}
        strokeWidth="3"
      />
      <path
        d="m134 75 22-27 24 27m-44 103 23 23 22-24"
        fill={c}
        stroke={ink}
        strokeWidth="3"
      />
      {kind === 1 && (
        <path
          d="M122 79v91m30-96v104"
          stroke="#fff4dc"
          strokeWidth="15"
          opacity=".8"
        />
      )}
      {kind === 5 && (
        <g transform="translate(147 120) scale(.6)">
          <Star fill="#fff5d1" />
        </g>
      )}
      {kind === 2 &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <circle
            key={i}
            cx={120 + ((i * 27) % 85)}
            cy={95 + ((i * 21) % 62)}
            r="4"
            fill="#a188c3"
          />
        ))}
      <circle cx="202" cy="109" r="7" fill={ink} />
      <circle cx="204" cy="107" r="2" fill="white" />
      <path d="M214 135q10 9 16-2" stroke={ink} strokeWidth="3" fill="none" />
      <ellipse cx="201" cy="130" rx="10" ry="5" fill="#ef8f9f" opacity=".6" />
    </g>
  );
}

export function ObjectDrawing({ kind = "umbrella" }: { kind?: string }) {
  const common = {
    stroke: ink,
    strokeWidth: 4,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };
  const objects: Record<string, React.ReactNode> = {
    umbrella: (
      <g {...common}>
        <path d="M150 105v83q0 28-25 20-13-5-8-18" fill="none" />
        <path
          d="M45 114Q55 28 150 28q96 0 105 86Q229 93 202 114q-26-23-52 0-26-23-52 0-26-23-53 0Z"
          fill="#ed9cb5"
        />
        <path
          d="M150 30q-48 29-52 84m52-84q48 29 52 84"
          fill="none"
          stroke="#bd718e"
        />
      </g>
    ),
    hat: (
      <g {...common}>
        <ellipse cx="150" cy="177" rx="112" ry="29" fill="#edbd7c" />
        <path d="M83 169 98 62q50-19 102 0l17 107Z" fill="#f7d597" />
        <path d="m87 140 126-1 4 30H83Z" fill="#e79ba1" />
      </g>
    ),
    spoon: (
      <g {...common} transform="rotate(25 150 120)">
        <ellipse cx="150" cy="67" rx="39" ry="47" fill="#b8cbd6" />
        <rect x="139" y="106" width="22" height="111" rx="11" fill="#a7bfce" />
        <path d="M130 50q8-14 20-13" stroke="white" fill="none" />
      </g>
    ),
    watering: (
      <g {...common}>
        <path
          d="M91 120Q25 70 61 52q34-15 45 48"
          fill="none"
          stroke="#7cbdab"
          strokeWidth="14"
        />
        <path d="M200 132 252 88l16 20-62 77" fill="#8dcbb5" />
        <rect x="83" y="91" width="131" height="116" rx="29" fill="#a5d8b9" />
        <path d="M139 90V67h30v23" fill="#a5d8b9" />
        <path d="m248 84 26 30" stroke="#5c9a91" strokeWidth="12" />
      </g>
    ),
    key: (
      <g {...common} transform="rotate(25 150 120)">
        <circle cx="150" cy="65" r="41" fill="#f7cf75" />
        <circle cx="150" cy="65" r="18" fill="#fff8e9" />
        <path d="M139 105v106h44v-22h-20v-22h20v-20h-20v-42Z" fill="#f7cf75" />
      </g>
    ),
    bell: (
      <g {...common}>
        <path
          d="M80 167q18-21 18-64 0-58 52-58t52 58q0 43 18 64Z"
          fill="#f1cc72"
        />
        <ellipse cx="150" cy="169" rx="73" ry="17" fill="#f8dfa0" />
        <circle cx="150" cy="194" r="17" fill="#d9a65b" />
        <circle cx="150" cy="32" r="14" fill="#b28970" />
      </g>
    ),
    guitar: (
      <g {...common} transform="rotate(18 150 130)">
        <path
          d="M120 101Q70 81 67 130q-47 57 5 82 62 21 83-39 49-20 17-61Z"
          fill="#e8b77d"
        />
        <path d="m139 113 52-84 18 10-49 88" fill="#b68c70" />
        <circle cx="117" cy="146" r="19" fill="#806354" />
        <path
          d="m89 187 108-149m-99 151 108-149"
          stroke="#fff1d0"
          strokeWidth="2"
        />
      </g>
    ),
    bass: (
      <g {...common} transform="rotate(-12 150 130)">
        <path
          d="M129 107q-48-28-57 22-43 58 15 81 61 15 74-38 39-38 9-63Z"
          fill="#d69f91"
        />
        <path d="m141 119 28-105 21 6-28 104" fill="#b48c75" />
        <path
          d="m116 190 60-168m-49 171 57-168"
          stroke="#fff2d6"
          strokeWidth="3"
        />
        <circle cx="117" cy="152" r="15" fill="#805f64" />
      </g>
    ),
    trumpet: (
      <g {...common}>
        <path d="M54 120h116l67-48v117l-67-44H54Z" fill="#edc46d" />
        <path
          d="M90 120V83h18v37m27 0V83h18v37M87 146q1 48 48 40t38-41"
          fill="none"
          stroke="#d7a653"
          strokeWidth="14"
        />
        <ellipse cx="237" cy="130" rx="14" ry="59" fill="#f7da87" />
      </g>
    ),
    wand: (
      <g {...common}>
        <path d="m97 211 74-123" stroke="#a998d4" strokeWidth="19" />
        <g transform="translate(189 63) scale(2)">
          <Star fill="#ffdc75" />
        </g>
      </g>
    ),
    ball: (
      <g {...common}>
        <circle cx="150" cy="123" r="91" fill="#f3b1bf" />
        <path
          d="M86 59q122 44 0 128m128-128Q92 103 214 187M59 123h182"
          fill="none"
          stroke="#fff3cf"
          strokeWidth="13"
        />
      </g>
    ),
    glasses: (
      <g {...common} fill="#c1e6ef">
        <circle cx="93" cy="130" r="44" />
        <circle cx="205" cy="130" r="44" />
        <path
          d="M138 130q11-18 23 0M49 130 31 82m218 48 18-48"
          fill="none"
          stroke={ink}
          strokeWidth="10"
        />
        <path d="m73 109 22-10m90 10 22-10" stroke="white" strokeWidth="8" />
      </g>
    ),
    mitten: (
      <g {...common}>
        <path
          d="M106 193V82q0-38 38-38h20q42 0 42 39v33l13-20q17-16 30 2 8 13-5 32l-38 57v25H106Z"
          fill="#eba8b3"
        />
        <path d="M102 191h107v27H102Z" fill="#b5a4d8" />
        <path
          d="m125 75 3 77m22-83 2 82m23-70v72"
          stroke="#f8d5d5"
          strokeWidth="5"
        />
      </g>
    ),
    drum: (
      <g {...common}>
        <ellipse cx="150" cy="175" rx="92" ry="28" fill="#e58f9a" />
        <path d="M58 95v80q92 40 184 0V95" fill="#f3b87d" />
        <path
          d="m65 111 35 72 35-69 35 71 36-71 30 65"
          fill="none"
          stroke="#fff2d4"
          strokeWidth="6"
        />
        <ellipse cx="150" cy="95" rx="92" ry="29" fill="#fff0ce" />
        <path d="m97 64 72-39m-11 43 57-40" stroke="#a87d66" strokeWidth="10" />
      </g>
    ),
  };
  return <>{objects[kind] || objects.ball}</>;
}

export function ModuleDrawing({ kind = 0 }: { kind?: number }) {
  if (kind === 1)
    return (
      <g>
        <path
          d="M51 193V117q0-73 99-73t99 73v76"
          fill="#a4b2dc"
          stroke={ink}
          strokeWidth="4"
        />
        <path
          d="M77 192v-70q0-47 73-47t73 47v70"
          fill="#6d779d"
          stroke={ink}
          strokeWidth="4"
        />
        <circle cx="150" cy="121" r="22" fill="#c3d5e9" />
        <path d="M150 100v42m-21-21h42" stroke="#7587b0" strokeWidth="4" />
      </g>
    );
  if (kind === 2)
    return (
      <g>
        <path
          d="m74 178-18 32m170-32 18 32"
          stroke="#a88b9b"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <ellipse
          cx="150"
          cy="165"
          rx="108"
          ry="30"
          fill="#f2abc0"
          stroke={ink}
          strokeWidth="4"
        />
        <ellipse
          cx="150"
          cy="159"
          rx="85"
          ry="17"
          fill="#fff3d2"
          stroke={ink}
          strokeWidth="3"
        />
        <path
          d="M77 149v21m33-28v33m41-35v38m40-34v30m33-25v21"
          stroke="#cf85a2"
          strokeWidth="3"
        />
      </g>
    );
  return (
    <g>
      <path
        d="M42 99q82 95 212 64v42H42Z"
        fill="#e6b87e"
        stroke={ink}
        strokeWidth="4"
      />
      <path
        d="M42 99q82 95 212 64"
        fill="none"
        stroke="#fff0c6"
        strokeWidth="17"
      />
      <path
        d="M63 154v48m38-30v30m43-19v19m43-17v17"
        stroke="#bd8b64"
        strokeWidth="5"
      />
    </g>
  );
}

export function Illustration({
  kind,
  className = "",
  value = 0,
}: {
  kind: string;
  className?: string;
  value?: number;
}) {
  let drawing: React.ReactNode;
  switch (kind) {
    case "rainbow-paint":
      drawing = (
        <>
          <rect
            x="35"
            y="30"
            width="230"
            height="175"
            rx="20"
            fill="#fffdf7"
            stroke="#e4d7c9"
            strokeWidth="4"
          />
          {["#ef82a5", "#ffd05a", "#79ccbc", "#ae91df"].map((c, i) => (
            <g
              key={c}
              transform={`translate(${65 + i * 44} ${55 + (i % 2) * 55}) scale(.45)`}
            >
              <Star fill={c} />
            </g>
          ))}
          <path
            d="M65 165Q110 125 150 170T240 135"
            fill="none"
            stroke="#79bce8"
            strokeWidth="17"
            strokeLinecap="round"
          />
        </>
      );
      break;
    case "block-smash":
      drawing = (
        <>
          {Array.from({ length: 9 }, (_, i) => (
            <g
              key={i}
              transform={`translate(${55 + (i % 3) * 65} ${170 - Math.floor(i / 3) * 48}) rotate(${i === 8 ? 15 : 0})`}
            >
              <rect
                width="59"
                height="43"
                rx="8"
                fill={["#ef9b9e", "#ffd05a", "#79ccbc"][i % 3]}
                stroke="#fff7ed"
                strokeWidth="3"
              />
            </g>
          ))}
          <circle cx="245" cy="70" r="25" fill="#b099dd" />
          <path
            d="M266 37l12-15m-2 38 18-4"
            stroke="#b099dd"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      );
      break;
    case "pancake":
      drawing = (
        <>
          <g transform="translate(0 29)">
            <PancakeDrawing />
          </g>
          <g transform="translate(142 87)">
            <ToppingDrawing kind={0} />
          </g>
          <g transform="translate(194 99) scale(.8)">
            <ToppingDrawing kind={1} />
          </g>
          <g transform="translate(96 114) scale(.65)">
            <ToppingDrawing kind={3} />
          </g>
          <g transform="translate(250 50) scale(.55)">
            <Star />
          </g>
        </>
      );
      break;
    case "toy-drum":
    case "animal-band":
      drawing = (
        <>
          <g transform="translate(0 3)">
            <AnimalDrawing kind={0} />
          </g>
          <g transform="translate(47 107) scale(.63)">
            <ObjectDrawing kind="drum" />
          </g>
          <path
            d="M239 67V32l28-6v29"
            fill="none"
            stroke="#a091ca"
            strokeWidth="7"
          />
          <circle cx="231" cy="69" r="10" fill="#a091ca" />
          <circle cx="260" cy="57" r="10" fill="#a091ca" />
        </>
      );
      break;
    case "car-wash":
      drawing = (
        <>
          <CarDrawing kind={value} />
          {[
            [62, 55, 15],
            [222, 36, 12],
            [267, 90, 8],
            [31, 126, 11],
          ].map(([x, y, r], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill="#fff9e8"
              stroke="#afd9e1"
              strokeWidth="2"
            />
          ))}
        </>
      );
      break;
    case "dinosaur-dig":
      drawing = <DinosaurDrawing kind={value} />;
      break;
    case "monster-dressup":
      drawing = (
        <MonsterDrawing
          look={{ ...defaultLook, horns: 1, eyes: 1, hair: 1, outfit: 1 }}
        />
      );
      break;
    case "space-walk":
      drawing = (
        <>
          <g transform="translate(-55 -10) scale(.78)">
            <PlanetDrawing kind={value} visited />
          </g>
          <g transform="translate(116 70) scale(.68)">
            <ShipDrawing />
          </g>
        </>
      );
      break;
    case "magic-garden":
      drawing = <PlantDrawing seed={value} variant="rainbow" />;
      break;
    case "block-town":
      drawing = (
        <>
          <g transform="translate(-20 15) scale(.9)">
            <BuildingDrawing kind={2} />
          </g>
          <g transform="translate(125 56) scale(.6)">
            <BuildingDrawing kind={3} />
          </g>
        </>
      );
      break;
    case "fishing-pond":
      drawing = (
        <>
          <g transform="translate(9 -7)">
            <FishDrawing kind={value} />
          </g>
          <circle
            cx="259"
            cy="39"
            r="13"
            fill="none"
            stroke="#79afc5"
            strokeWidth="3"
          />
          <circle
            cx="240"
            cy="16"
            r="6"
            fill="none"
            stroke="#79afc5"
            strokeWidth="2"
          />
        </>
      );
      break;
    case "shadow-lost-found":
      drawing = (
        <>
          <g transform="translate(-9 10) scale(.72)">
            <AnimalDrawing kind={4} />
          </g>
          <g transform="translate(139 15) scale(.58)">
            <ObjectDrawing kind="umbrella" />
          </g>
        </>
      );
      break;
    case "ball-factory":
      drawing = (
        <>
          <g transform="translate(-9 1)">
            <ModuleDrawing kind={2} />
          </g>
          <circle
            cx="151"
            cy="71"
            r="27"
            fill="#f29b91"
            stroke={ink}
            strokeWidth="3"
          />
          <Face x={151} y={70} scale={0.45} />
          <g transform="translate(243 39) scale(.55)">
            <Star />
          </g>
        </>
      );
      break;
    default:
      drawing = <AnimalDrawing kind={value} />;
  }
  return (
    <svg
      viewBox="0 0 300 240"
      className={`illustration ${className}`}
      aria-hidden="true"
    >
      {drawing}
    </svg>
  );
}
