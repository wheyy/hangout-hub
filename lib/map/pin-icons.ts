export function createSearchPinElement(isLoading: boolean = false): HTMLElement {
  const container = document.createElement("div")
  container.style.width = "64px"
  container.style.height = "74px"
  container.style.cursor = "grab"
  container.style.zIndex = "100"
  container.style.position = "relative"
  container.className = "search-pin"

  if (isLoading) {
    // Loading state: blue pin with spinner
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
        </g>
      </svg>
    `
    container.innerHTML = svg

    // Add CSS spinner in the center
    const spinner = document.createElement("div")
    spinner.className = "pin-spinner"
    spinner.style.position = "absolute"
    spinner.style.top = "14px"
    spinner.style.left = "50%"
    spinner.style.transform = "translateX(-50%)"
    spinner.style.width = "18px"
    spinner.style.height = "18px"
    spinner.style.border = "2.5px solid white"
    spinner.style.borderTopColor = "transparent"
    spinner.style.borderRadius = "50%"
    spinner.style.animation = "spin 1s linear infinite"
    spinner.style.pointerEvents = "none"

    // Add keyframes if not already added
    if (!document.querySelector('#spin-keyframes')) {
      const style = document.createElement('style')
      style.id = 'spin-keyframes'
      style.textContent = `
        @keyframes spin {
          0% { transform: translateX(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(360deg); }
        }
      `
      document.head.appendChild(style)
    }

    container.appendChild(spinner)
  } else {
    // Normal state: blue pin with search icon
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

          <g transform="translate(32, 20)" class="pin-icon">
            <circle cx="0" cy="-2" r="7" stroke="white" stroke-width="2.5" fill="none"/>
            <line x1="5" y1="2.5" x2="8" y2="5.5" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </g>
        </g>
      </svg>
    `
    container.innerHTML = svg
  }

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
  const finalColor = baseColor || "#EF4444"
  circle.style.backgroundColor = finalColor
  circle.style.setProperty("background-color", finalColor, "important")
  circle.style.border = isSelected ? "3px solid white" : "2px solid white"
  circle.style.boxShadow = isSelected 
    ? `0 0 0 2px ${finalColor}, 0 4px 8px rgba(0,0,0,0.3)` 
    : "0 2px 4px rgba(0,0,0,0.3)"
  circle.style.transition = "all 0.2s ease"
  
  // Add pulsating animation for selected markers
  if (isSelected) {
    circle.style.animation = "pulse 2s ease-in-out infinite"
    // Add keyframes to document if not already added
    if (!document.querySelector('#pulse-keyframes')) {
      const style = document.createElement('style')
      style.id = 'pulse-keyframes'
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
      `
      document.head.appendChild(style)
    }
  }
  
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
    label.style.border = isSelected ? `2px solid ${finalColor}` : "2px solid transparent"
    label.style.transition = "border-color 0.2s ease"
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

export function createParkingSpotPinElement(
  title?: string,
  isSelected: boolean = false,
  availabilityPercentage?: number
): HTMLElement {
  const container = document.createElement("div")
  container.style.cursor = "pointer"
  container.style.zIndex = "50"
  container.className = "parking-pin"

  // Determine color based on availability percentage
  let backgroundColor: string
  if (availabilityPercentage === undefined || availabilityPercentage === null) {
    backgroundColor = "#6B7280" // Gray for no data (darker for contrast with white P)
  } else if (availabilityPercentage >= 50) {
    backgroundColor = "#22C55E" // Green for high availability
  } else if (availabilityPercentage >= 20) {
    backgroundColor = "#F59E0B" // Amber for medium availability
  } else {
    backgroundColor = "#EF4444" // Red for low availability
  }

  // Create square with rounded corners
  const square = document.createElement("div")
  square.className = "parking-square"
  square.style.width = "24px"
  square.style.height = "24px"
  square.style.borderRadius = "4px"
  square.style.backgroundColor = backgroundColor
  square.style.border = isSelected ? "3px solid #2563EB" : "2px solid white"
  square.style.boxShadow = isSelected
    ? "0 4px 8px rgba(0,0,0,0.3)"
    : "0 2px 4px rgba(0,0,0,0.3)"
  square.style.transition = "all 0.2s ease"
  square.style.display = "flex"
  square.style.alignItems = "center"
  square.style.justifyContent = "center"

  // Add "P" letter
  const pLetter = document.createElement("span")
  pLetter.className = "parking-p-letter"
  pLetter.textContent = "P"
  pLetter.style.color = "white"
  pLetter.style.fontSize = isSelected ? "16px" : "14px"
  pLetter.style.fontWeight = "bold"
  pLetter.style.lineHeight = "1"
  pLetter.style.userSelect = "none"
  pLetter.style.transition = "font-size 0.2s ease"
  square.appendChild(pLetter)

  container.appendChild(square)

  // Add label if title is provided
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
    label.style.border = isSelected ? "2px solid #2563EB" : "2px solid transparent"
    label.style.transition = "border-color 0.2s ease"
    container.appendChild(label)
  }

  // Hover effect
  container.addEventListener("mouseenter", () => {
    square.style.transform = "scale(1.2)"
  })

  container.addEventListener("mouseleave", () => {
    square.style.transform = "scale(1)"
  })

  return container
}
