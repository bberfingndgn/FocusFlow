interface FlowerProps {
  progress: number; // 0-100
  subject: string;
}

const subjectStyles: Record<string, Record<string, string>> = {
  "Mathematics": {
    stem: "#2E7D32", // Dark green
    leaf: "#4CAF50", // Lighter green
    petal: "#FFC107", // Amber
    petalAccent: "#FFA000", // Orange
    center: "#795548", // Brown
    ground: "#A1662F",
    bulb: "#D2B48C"
  },
  "Science": {
    stem: "#6A8A82",
    leaf: "#6A8A82",
    bud: "#3B82F6",
    petal: "#60A5FA",
    petalAccent: "#3B82F6",
    center: "#022c22",
  },
  "Social Studies": {
    stem: "#5C6B73",
    leaf: "#5C6B73",
    bud: "#EC4899",
    petal: "#F472B6",
    petalAccent: "#EC4899",
    center: "#831843",
  },
  "English": {
    stem: "#8a6c3a",
    leaf: "#8a6c3a",
    bud: "#FBBF24",
    petal: "#ffffff",
    petalAccent: "#FCD34D",
    center: "#FBBF24",
  }
}

const DefaultStyle = {
  stem: "#2E7D32",
  leaf: "#4CAF50",
  petal: "#FFC107",
  petalAccent: "#FFA000",
  center: "#795548",
  ground: "#A1662F",
  bulb: "#D2B48C"
}

const PetalShapes: Record<string, React.FC<{ style: typeof DefaultStyle }>> = {
  "Science": ({ style }) => (
    <>
      <path d="M100 45 C 90 20, 110 20, 100 45" transform="rotate(0 100 45)" fill={style.petal} />
      <path d="M100 45 C 90 20, 110 20, 100 45" transform="rotate(45 100 45)" fill={style.petal} />
      <path d="M100 45 C 90 20, 110 20, 100 45" transform="rotate(90 100 45)" fill={style.petalAccent} />
      <path d="M100 45 C 90 20, 110 20, 100 45" transform="rotate(135 100 45)" fill={style.petal} />
      <path d="M100 45 C 90 20, 110 20, 100 45" transform="rotate(180 100 45)" fill={style.petal} />
      <path d="M100 45 C 90 20, 110 20, 100 45" transform="rotate(225 100 45)" fill={style.petalAccent} />
      <path d="M100 45 C 90 20, 110 20, 100 45" transform="rotate(270 100 45)" fill={style.petal} />
      <path d="M100 45 C 90 20, 110 20, 100 45" transform="rotate(315 100 45)" fill={style.petalAccent} />
    </>
  ),
  "Mathematics": ({ style }) => (
    <>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <path 
          key={angle}
          d="M100,45 C 90,20 110,20 100,45" 
          fill={i % 2 === 0 ? style.petal : style.petalAccent}
          transform={`rotate(${angle} 100 45) scale(1.2)`} 
        />
      ))}
    </>
  ),
  "Social Studies": ({ style }) => (
    <>
      <path d="M100,45 C70,45 70,15 100,15 C130,15 130,45 100,45" fill={style.petalAccent} />
      <path d="M100,45 C80,45 80,25 100,25 C120,25 120,45 100,45" fill={style.petal} />
    </>
  ),
  "English": ({ style }) => (
    <>
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
        <ellipse key={angle} cx="100" cy="25" rx="8" ry="15" fill={style.petal} transform={`rotate(${angle} 100 45)`} />
      ))}
    </>
  ),
};


export function Flower({ progress, subject }: FlowerProps) {
  const getOpacity = (threshold: number) => (progress >= threshold ? 1 : 0.3);
  const getScale = (start: number, end: number) => {
    if (progress < start) return 0;
    if (progress > end) return 1;
    return (progress - start) / (end - start);
  };
  
  const style = subjectStyles[subject] || DefaultStyle;
  const PetalComponent = PetalShapes[subject] || PetalShapes["Science"];

  const rootScale = getScale(0, 20);
  const stemScale = getScale(15, 50);
  const sproutLeafScale = getScale(20, 40);
  const leaf1Scale = getScale(30, 60);
  const leaf2Scale = getScale(40, 70);
  const budScale = getScale(65, 85);
  const petalScale = getScale(80, 100);

  // Hide sprout leaves once real leaves grow
  const sproutOpacity = progress > 50 ? 1 - getScale(50, 60) : 1;

  return (
    <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center" aria-label={`Flower growth progress: ${Math.round(progress)}%`}>
      <svg viewBox="0 0 200 200" className="w-full h-full">

        {/* Bulb/Roots */}
        <g style={{ transformOrigin: 'top center', transform: `scale(${rootScale})`, transition: 'transform 1s ease-out' }} opacity={getOpacity(5)}>
             <path d="M100 135 C 90 150, 90 160, 100 170 C 110 160, 110 150, 100 135 Z" fill={style.bulb} stroke="#653424" strokeWidth="1"/>
        </g>
        
        {/* Stem */}
        <g style={{ transformOrigin: 'bottom center', transform: `scaleY(${stemScale})`, transition: 'transform 1s ease-out' }}>
          <path d="M98 130 Q 98 90, 100 45 L 102 45 Q 102 90, 102 130 Z" fill={style.stem} stroke="#000" strokeWidth="0.5"/>
        </g>
        
        {/* Initial Sprout Leaves */}
        <g style={{ transformOrigin: '100px 130px', transform: `scale(${sproutLeafScale})`, transition: 'transform 1s ease-out', opacity: sproutOpacity }} opacity={getOpacity(20)}>
           <path d="M100 130 C 90 120, 90 110, 100 115" fill={style.leaf} transform="rotate(-15 100 130)" />
           <path d="M100 130 C 110 120, 110 110, 100 115" fill={style.leaf} transform="rotate(15 100 130)" />
        </g>

        {/* Mature Leaves */}
        <g style={{ transformOrigin: '100px 110px', transform: `scale(${leaf1Scale}) rotate(-15deg)`, transition: 'transform 1s ease-out' }} opacity={getOpacity(30)}>
          <path d="M100 110 C 60 110, 70 80, 100 90" fill={style.leaf} stroke="#2E7D32" strokeWidth="1" />
        </g>
        <g style={{ transformOrigin: '100px 100px', transform: `scale(${leaf2Scale}) rotate(15deg)`, transition: 'transform 1s ease-out' }} opacity={getOpacity(40)}>
          <path d="M100 100 C 140 100, 130 70, 100 80" fill={style.leaf} stroke="#2E7D32" strokeWidth="1" />
        </g>
        
        {/* Bud/Center */}
        <g style={{ transformOrigin: 'center', transform: `scale(${budScale})`, transition: 'transform 1s ease-out' }} opacity={getOpacity(65)}>
            <circle cx="100" cy="45" r="12" fill={style.center} />
        </g>

        {/* Petals */}
        <g style={{ transformOrigin: '50% 45px', transform: `scale(${petalScale})`, transition: 'transform 1s ease-out'}} opacity={getOpacity(80)}>
           <PetalComponent style={style} />
        </g>
        
        {/* Center Detail */}
         <g style={{ transformOrigin: 'center', transform: `scale(${petalScale})`, transition: 'transform 1s ease-out' }} opacity={getOpacity(85)}>
            <circle cx="100" cy="45" r="12" fill={style.center} stroke="#000" strokeWidth="0.5" />
             {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                 <line key={angle} x1="100" y1="45" x2="100" y2="36" stroke={style.petalAccent} strokeWidth="1" transform={`rotate(${angle + 22.5} 100 45)`} />
             ))}
        </g>


        {/* Fully Bloomed Sparkle */}
        {progress >= 100 && (
           <g style={{ animation: 'pulse 2s infinite', transformOrigin: '100px 45px' }}>
              <path d="M100 10 L103 23 L115 25 L103 27 L100 40 L97 27 L85 25 L97 23 Z" fill="rgba(255, 255, 255, 0.8)" opacity="0.7"/>
           </g>
        )}
        <style>{`
          @keyframes pulse {
            0% { transform: scale(0.9) rotate(0deg); opacity: 0.7; }
            50% { transform: scale(1.1) rotate(5deg); opacity: 1; }
            100% { transform: scale(0.9) rotate(0deg); opacity: 0.7; }
          }
        `}</style>
      </svg>
    </div>
  );
}
