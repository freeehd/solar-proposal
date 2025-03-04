// Helper function to create a sample logo ImageData for the MetallicPaint component
export function createLogoImageData(): ImageData {
  // Create a canvas to draw the logo
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  const size = 200
  canvas.width = size
  canvas.height = size

  if (!ctx) {
    throw new Error("Could not get canvas context")
  }

  // Fill with white (transparent for the shader)
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, size, size)

  // Draw a sun-like logo
  ctx.fillStyle = "black"

  // Draw circle
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2)
  ctx.fill()

  // Draw rays
  const rayCount = 12
  const innerRadius = size / 3
  const outerRadius = size / 2.2

  ctx.beginPath()
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2
    const x1 = size / 2 + Math.cos(angle) * innerRadius
    const y1 = size / 2 + Math.sin(angle) * innerRadius
    const x2 = size / 2 + Math.cos(angle) * outerRadius
    const y2 = size / 2 + Math.sin(angle) * outerRadius

    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineWidth = size / 20
    ctx.stroke()
  }

  return ctx.getImageData(0, 0, size, size)
}

