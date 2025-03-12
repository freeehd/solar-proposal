"use client"

import { useEffect, useRef, useState, useCallback } from "react"


type ShaderParams = {
  patternScale: number
  refraction: number
  edge: number
  patternBlur: number
  liquid: number
  speed: number
  color1: string
  color2: string
}

const defaultParams: ShaderParams = {
  patternScale: 2,
  refraction: 0.015,
  edge: 1,
  patternBlur: 0.005,
  liquid: 0.07,
  speed: 0.3,
  color1: "#aa0000",
  color2: "#aa0000",
}

export function parseLogoImage(
  file: File,
): Promise<{ imageData: ImageData; pngBlob: Blob; width: number; height: number }> {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  return new Promise((resolve, reject) => {
    if (!file || !ctx) {
      reject(new Error("Invalid file or context"))
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // Get the natural dimensions of the image
      let width = img.naturalWidth
      let height = img.naturalHeight

      // Apply size constraints if needed
      const MAX_SIZE = 1000
      const MIN_SIZE = 100 // Lowered minimum size to allow smaller SVGs

      if (width > MAX_SIZE || height > MAX_SIZE) {
        const aspectRatio = width / height
        if (width > height) {
          width = MAX_SIZE
          height = Math.round(width / aspectRatio)
        } else {
          height = MAX_SIZE
          width = Math.round(height * aspectRatio)
        }
      } else if (width < MIN_SIZE || height < MIN_SIZE) {
        const aspectRatio = width / height
        if (width < height) {
          width = MIN_SIZE
          height = Math.round(width / aspectRatio)
        } else {
          height = MIN_SIZE
          width = Math.round(height * aspectRatio)
        }
      }

      // Set canvas size to match the image dimensions
      canvas.width = width
      canvas.height = height

      // Draw the image on the canvas
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      // Process the image for the metallic effect
      const shapeCanvas = document.createElement("canvas")
      shapeCanvas.width = width
      shapeCanvas.height = height
      const shapeCtx = shapeCanvas.getContext("2d")!
      shapeCtx.drawImage(img, 0, 0, width, height)

      const shapeImageData = shapeCtx.getImageData(0, 0, width, height)
      const data = shapeImageData.data
      const shapeMask = new Array(width * height).fill(false)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx4 = (y * width + x) * 4
          const r = data[idx4]
          const g = data[idx4 + 1]
          const b = data[idx4 + 2]
          const a = data[idx4 + 3]
          shapeMask[y * width + x] = !((r === 255 && g === 255 && b === 255 && a === 255) || a === 0)
        }
      }

      function inside(x: number, y: number) {
        if (x < 0 || x >= width || y < 0 || y >= height) return false
        return shapeMask[y * width + x]
      }

      const boundaryMask = new Array(width * height).fill(false)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x
          if (!shapeMask[idx]) continue
          let isBoundary = false
          for (let ny = y - 1; ny <= y + 1 && !isBoundary; ny++) {
            for (let nx = x - 1; nx <= x + 1 && !isBoundary; nx++) {
              if (!inside(nx, ny)) {
                isBoundary = true
              }
            }
          }
          if (isBoundary) {
            boundaryMask[idx] = true
          }
        }
      }

      const interiorMask = new Array(width * height).fill(false)
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x
          if (
            shapeMask[idx] &&
            shapeMask[idx - 1] &&
            shapeMask[idx + 1] &&
            shapeMask[idx - width] &&
            shapeMask[idx + width]
          ) {
            interiorMask[idx] = true
          }
        }
      }

      const u = new Float32Array(width * height).fill(0)
      const newU = new Float32Array(width * height).fill(0)
      const C = 0.01
      const ITERATIONS = 300

      function getU(x: number, y: number, arr: Float32Array) {
        if (x < 0 || x >= width || y < 0 || y >= height) return 0
        if (!shapeMask[y * width + x]) return 0
        return arr[y * width + x]
      }

      for (let iter = 0; iter < ITERATIONS; iter++) {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = y * width + x
            if (!shapeMask[idx] || boundaryMask[idx]) {
              newU[idx] = 0
              continue
            }
            const sumN = getU(x + 1, y, u) + getU(x - 1, y, u) + getU(x, y + 1, u) + getU(x, y - 1, u)
            newU[idx] = (C + sumN) / 4
          }
        }
        u.set(newU)
      }

      let maxVal = 0
      for (let i = 0; i < width * height; i++) {
        if (u[i] > maxVal) maxVal = u[i]
      }
      const alpha = 2.0
      const outImg = ctx.createImageData(width, height)

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x
          const px = idx * 4
          if (!shapeMask[idx]) {
            outImg.data[px] = 255
            outImg.data[px + 1] = 255
            outImg.data[px + 2] = 255
            outImg.data[px + 3] = 0 // Make non-shape pixels transparent
          } else {
            const raw = u[idx] / maxVal
            const remapped = Math.pow(raw, alpha)
            const gray = 255 * (1 - remapped)
            outImg.data[px] = gray
            outImg.data[px + 1] = gray
            outImg.data[px + 2] = gray
            outImg.data[px + 3] = 255
          }
        }
      }
      ctx.putImageData(outImg, 0, 0)

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to create PNG blob"))
          return
        }
        resolve({
          imageData: outImg,
          pngBlob: blob,
          width,
          height,
        })
      }, "image/png")
    }

    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = URL.createObjectURL(file)
  })
}

const vertexShaderSource = `#version 300 es
precision mediump float;

in vec2 a_position;
out vec2 vUv;

void main() {
    vUv = .5 * (a_position + 1.);
    gl_Position = vec4(a_position, 0.0, 1.0);
}`

const liquidFragSource = `#version 300 es
precision mediump float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D u_image_texture;
uniform float u_time;
uniform float u_ratio;
uniform float u_img_ratio;
uniform float u_patternScale;
uniform float u_refraction;
uniform float u_edge;
uniform float u_patternBlur;
uniform float u_liquid;
uniform vec3 u_color1;
uniform vec3 u_color2;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x*34.)+1.)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
  m = m*m;
  m = m*m;
  vec3 x = 2. * fract(p * C.www) - 1.;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130. * dot(m, g);
}

vec2 get_img_uv() {
  vec2 img_uv = vUv;
  
  // Adjust for aspect ratio differences
  float canvasRatio = u_ratio;
  float imageRatio = u_img_ratio;
  
  // Center the image in the canvas
  img_uv -= 0.5;
  
  if (canvasRatio > imageRatio) {
    // Canvas is wider than image
    img_uv.x *= canvasRatio / imageRatio;
  } else {
    // Canvas is taller than image
    img_uv.y *= imageRatio / canvasRatio;
  }
  
  img_uv += 0.5;
  
  // Flip Y coordinate for WebGL
  img_uv.y = 1.0 - img_uv.y;
  
  return img_uv;
}

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float get_color_channel(float c1, float c2, float stripe_p, vec3 w, float extra_blur, float b) {
  float ch = c2;
  float border = 0.;
  float blur = u_patternBlur + extra_blur;
  ch = mix(ch, c1, smoothstep(.0, blur, stripe_p));
  border = w[0];
  ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
  b = smoothstep(.2, .8, b);
  border = w[0] + .4 * (1. - b) * w[1];
  ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
  border = w[0] + .5 * (1. - b) * w[1];
  ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border - blur, border + blur, stripe_p));
  return ch;
}

float get_img_frame_alpha(vec2 uv, float img_frame_width) {
  float img_frame_alpha = smoothstep(0., img_frame_width, uv.x) * smoothstep(1., 1. - img_frame_width, uv.x);
  img_frame_alpha *= smoothstep(0., img_frame_width, uv.y) * smoothstep(1., 1. - img_frame_width, uv.y);
  return img_frame_alpha;
}

void main() {
  vec2 uv = vUv;
  uv.y = 1. - uv.y;
  
  // Apply aspect ratio to UV coordinates
  float diagonal = uv.x - uv.y;
  float t = .001 * u_time;
  
  // Get image UV coordinates
  vec2 img_uv = get_img_uv();
  vec4 img = texture(u_image_texture, img_uv);
  
  // Skip processing for transparent pixels
  if (img.a < 0.01) {
    fragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }
  
  vec3 color = vec3(0.);
  float opacity = 1.;
  vec3 color1 = u_color1;
  vec3 color2 = u_color2;
  float edge = img.r;
  
  vec2 grad_uv = uv;
  grad_uv -= .5;
  float dist = length(grad_uv + vec2(0., .2 * diagonal));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagonal) * PI);
  float bulge = pow(1.8 * dist, 1.2);
  bulge = 1. - bulge;
  bulge *= pow(uv.y, .3);
  float cycle_width = u_patternScale;
  float thin_strip_1_ratio = .12 / cycle_width * (1. - .4 * bulge);
  float thin_strip_2_ratio = .07 / cycle_width * (1. + .4 * bulge);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);
  float thin_strip_1_width = cycle_width * thin_strip_1_ratio;
  float thin_strip_2_width = cycle_width * thin_strip_2_ratio;
  opacity = 1. - smoothstep(.9 - .5 * u_edge, 1. - .5 * u_edge, edge);
  opacity *= get_img_frame_alpha(img_uv, 0.01);
  float noise = snoise(uv - t);
  edge += (1. - edge) * u_liquid * noise;
  float refr = 0.;
  refr += (1. - bulge);
  refr = clamp(refr, 0., 1.);
  float dir = grad_uv.x;
  dir += diagonal;
  dir -= 2. * noise * diagonal * (smoothstep(0., 1., edge) * smoothstep(1., 0., edge));
  bulge *= clamp(pow(uv.y, .1), .3, 1.);
  dir *= (.1 + (1.1 - edge) * bulge);
  dir *= smoothstep(1., .7, edge);
  dir += .18 * (smoothstep(.1, .2, uv.y) * smoothstep(.4, .2, uv.y));
  dir += .03 * (smoothstep(.1, .2, 1. - uv.y) * smoothstep(.4, .2, 1. - uv.y));
  dir *= (.5 + .5 * pow(uv.y, 2.));
  dir *= cycle_width;
  dir -= t;
  float refr_r = refr;
  refr_r += .03 * bulge * noise;
  float refr_b = 1.3 * refr;
  refr_r += 5. * (smoothstep(-.1, .2, uv.y) * smoothstep(.5, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(1., .4, bulge));
  refr_r -= diagonal;
  refr_b += (smoothstep(0., .4, uv.y) * smoothstep(.8, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(.8, .4, bulge));
  refr_b -= .2 * edge;
  refr_r *= u_refraction;
  refr_b *= u_refraction;
  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., edge + bulge);
  float stripe_r = mod(dir + refr_r, 1.);
  float r = get_color_channel(color1.r, color2.r, stripe_r, w, 0.02 + .03 * u_refraction * bulge, bulge);
  float stripe_g = mod(dir, 1.);
  float g = get_color_channel(color1.g, color2.g, stripe_g, w, 0.01 / (1. - diagonal), bulge);
  float stripe_b = mod(dir - refr_b, 1.);
  float b = get_color_channel(color1.b, color2.b, stripe_b, w, .01, bulge);
  color = vec3(r, g, b);
  
  // Apply opacity from the original image
  opacity *= img.a;
  color *= opacity;
  
  fragColor = vec4(color, opacity);
}
`

// Add a helper function to convert hex color to RGB values
function hexToRgb(hex: string): [number, number, number] {
  // Remove # if present
  hex = hex.replace(/^#/, "")

  // Parse the hex values
  const r = Number.parseInt(hex.substring(0, 2), 16) / 255
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255

  return [r, g, b]
}

export default function MetallicPaint({
  imageData,
  params = defaultParams,
  width,
  height,
}: {
  imageData: ImageData
  params: ShaderParams
  width: number
  height: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gl, setGl] = useState<WebGL2RenderingContext | null>(null)
  const [uniforms, setUniforms] = useState<Record<string, WebGLUniformLocation>>({})
  const totalAnimationTime = useRef(0)
  const lastRenderTime = useRef(0)
  const programRef = useRef<WebGLProgram | null>(null)
  const [program, setProgram] = useState<WebGLProgram | null>(null)
  const [initialized, setInitialized] = useState(false)
  const animationRef = useRef<number>(0)

  // Update the updateUniforms function to include color uniforms
  const updateUniforms = useCallback(() => {
    if (!gl || !uniforms || !program) return

    // IMPORTANT: Always use the program before setting uniforms
    gl.useProgram(program)

    gl.uniform1f(uniforms.u_edge, params.edge)
    gl.uniform1f(uniforms.u_patternBlur, params.patternBlur)
    gl.uniform1f(uniforms.u_patternScale, params.patternScale)
    gl.uniform1f(uniforms.u_refraction, params.refraction)
    gl.uniform1f(uniforms.u_liquid, params.liquid)

    // Set color uniforms
    const color1 = hexToRgb(params.color1)
    const color2 = hexToRgb(params.color2)
    gl.uniform3f(uniforms.u_color1, color1[0], color1[1], color1[2])
    gl.uniform3f(uniforms.u_color2, color2[0], color2[1], color2[2])
  }, [
    gl,
    uniforms,
    program,
    params.edge,
    params.patternBlur,
    params.patternScale,
    params.refraction,
    params.liquid,
    params.color1,
    params.color2,
  ])

  // Start animation function
  const startAnimation = useCallback(() => {
    if (!gl || !uniforms || !program) return

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Reset animation time
    totalAnimationTime.current = 0
    lastRenderTime.current = performance.now()

    // Animation function
    const animate = (currentTime: number) => {
      if (!gl || !program) return

      // Use the program
      gl.useProgram(program)

      // Calculate delta time
      const deltaTime = currentTime - lastRenderTime.current
      lastRenderTime.current = currentTime

      // Update animation time
      totalAnimationTime.current += deltaTime * params.speed

      // Set time uniform
      gl.uniform1f(uniforms.u_time, totalAnimationTime.current)

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      // Continue animation
      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)
  }, [gl, uniforms, program, params.speed])

  // Initialize WebGL
  useEffect(() => {
    function initShader() {
      const canvas = canvasRef.current
      const gl = canvas?.getContext("webgl2", {
        antialias: true,
        alpha: true,
        premultipliedAlpha: false,
      })
      if (!canvas || !gl) {
        console.error("Failed to get WebGL context")
        return
      }

      // Enable alpha blending
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      function createShader(gl: WebGL2RenderingContext, sourceCode: string, type: number) {
        const shader = gl.createShader(type)
        if (!shader) {
          console.error("Failed to create shader")
          return null
        }

        gl.shaderSource(shader, sourceCode)
        gl.compileShader(shader)

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error("Shader compilation error:", gl.getShaderInfoLog(shader))
          gl.deleteShader(shader)
          return null
        }

        return shader
      }

      const vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER)
      const fragmentShader = createShader(gl, liquidFragSource, gl.FRAGMENT_SHADER)

      if (!vertexShader || !fragmentShader) {
        console.error("Failed to create shaders")
        return
      }

      const program = gl.createProgram()
      if (!program) {
        console.error("Failed to create program")
        return
      }

      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program linking error:", gl.getProgramInfoLog(program))
        return
      }

      // Use the program immediately
      gl.useProgram(program)

      // Get uniform locations
      function getUniforms(program: WebGLProgram, gl: WebGL2RenderingContext) {
        const uniforms: Record<string, WebGLUniformLocation> = {}
        const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
        for (let i = 0; i < uniformCount; i++) {
          const uniformInfo = gl.getActiveUniform(program, i)
          if (!uniformInfo) continue
          const location = gl.getUniformLocation(program, uniformInfo.name)
          if (location) {
            uniforms[uniformInfo.name] = location
          }
        }
        return uniforms
      }

      const uniforms = getUniforms(program, gl)

      // Set up vertex buffer
      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
      const vertexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

      const positionLocation = gl.getAttribLocation(program, "a_position")
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      // Set state
      setGl(gl)
      setProgram(program)
      setUniforms(uniforms)
      programRef.current = program
      setInitialized(true)

      console.log("WebGL initialized successfully")
    }

    initShader()

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Set up canvas and texture when initialized
  useEffect(() => {
    if (!gl || !program || !uniforms || !imageData) return

    console.log("Setting up canvas and texture")

    // Use the program
    gl.useProgram(program)

    // Set up canvas
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    // Set canvas size
    canvasEl.width = width
    canvasEl.height = height

    // Set viewport
    gl.viewport(0, 0, width, height)

    // Set aspect ratio uniforms
    const imgRatio = imageData.width / imageData.height
    gl.uniform1f(uniforms.u_ratio, width / height)
    gl.uniform1f(uniforms.u_img_ratio, imgRatio)

    // Set up texture
    const imageTexture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, imageTexture)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)

    try {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        imageData.width,
        imageData.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        imageData.data,
      )

      gl.uniform1i(uniforms.u_image_texture, 0)

      // Update other uniforms
      updateUniforms()

      // Start animation
      startAnimation()

      console.log("Canvas and texture set up successfully")
    } catch (e) {
      console.error("Error setting up texture:", e)
    }
  }, [gl, program, uniforms, imageData, width, height, updateUniforms, startAnimation])

  // Update uniforms when parameters change
  useEffect(() => {
    if (!gl || !program || !uniforms) return
    updateUniforms()
  }, [gl, program, uniforms, updateUniforms, params])

  return (
    <canvas
      ref={canvasRef}
      className="block w-12 h-full "
      style={{
        width: width,
        height: height,
        display: "block",
      }}
    />
  )
}

