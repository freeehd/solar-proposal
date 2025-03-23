import Image from "next/image"

interface IconProps {
  size?: number
}

export default function Icon({ size = 32 }: IconProps) {
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <Image 
        src="/icon.png" 
        alt="Sun Studios Icon" 
        width={size} 
        height={size} 
        style={{ width: "auto", height: "auto" }} // Fix aspect ratio warning
      />
    </div>
  )
}
