export function createSearchPinElement(): HTMLElement {
  const container = document.createElement("div")
  container.style.width = "64px"
  container.style.height = "74px"
  container.style.cursor = "grab"
  container.style.zIndex = "100"
  
  const svg = `
    <svg width="64" height="74" viewBox="0 0 64 74" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="search-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="3" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.4"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <g filter="url(#search-shadow)">
        <path d="M32 4C23.163 4 16 11.163 16 20C16 32 32 68 32 68C32 68 48 32 48 20C48 11.163 40.837 4 32 4Z" 
              fill="#3B82F6" stroke="white" stroke-width="3"/>
        
        <g transform="translate(32, 20)">
          <circle cx="0" cy="-2" r="7" stroke="white" stroke-width="2.5" fill="none"/>
          <line x1="5" y1="2.5" x2="8" y2="5.5" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </g>
      </g>
    </svg>
  `

  container.innerHTML = svg
  return container
}

export function createHangoutSpotPinElement(title?: string, isSelected: boolean = false, baseColor?: string): HTMLElement {
  const container = document.createElement("div")
  container.style.cursor = "pointer"
  container.style.zIndex = "50"
  container.className = "hangout-pin"
  
  const circle = document.createElement("div")
  circle.className = "pin-circle"
  circle.style.width = "24px"
  circle.style.height = "24px"
  circle.style.borderRadius = "50%"
  const unselectedColor = baseColor || "#EF4444"
  circle.style.backgroundColor = isSelected ? "#F97316" : unselectedColor
  circle.style.border = isSelected ? "3px solid white" : "2px solid white"
  circle.style.boxShadow = isSelected 
    ? "0 0 0 2px #F97316, 0 4px 8px rgba(0,0,0,0.3)" 
    : "0 2px 4px rgba(0,0,0,0.3)"
  circle.style.transition = "all 0.2s ease"
  
  container.appendChild(circle)
  
  if (title) {
    const label = document.createElement("div")
    label.className = "pin-label"
    label.textContent = title
    label.style.position = "absolute"
    label.style.left = "30px"
    label.style.top = "50%"
    label.style.transform = "translateY(-50%)"
    label.style.backgroundColor = "white"
    label.style.padding = "4px 8px"
    label.style.borderRadius = "4px"
    label.style.fontSize = "12px"
    label.style.fontWeight = "500"
    label.style.whiteSpace = "nowrap"
    label.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)"
    label.style.pointerEvents = "none"
    container.appendChild(label)
  }

  container.addEventListener("mouseenter", () => {
    circle.style.transform = "scale(1.2)"
  })

  container.addEventListener("mouseleave", () => {
    circle.style.transform = "scale(1)"
  })

  return container
}
