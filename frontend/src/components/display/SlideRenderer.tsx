import { useRef } from 'react'
import { useAutoFitFontSize } from '../../hooks/useAutoFitFontSize'
import { resolveImageUrl } from '../../lib/api'
import { normalizeForDisplay, parseFormattedText } from '../../lib/richText'
import type { LiveState, Settings } from '../../types'

interface Props {
  liveState: LiveState | null
  settings: Settings | null
}

export default function SlideRenderer({ liveState, settings }: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const bgColor = settings?.background_color ?? '#000000'
  const bgImage = settings?.background_image_url
  const imageUrl = !liveState?.is_blank ? liveState?.slide?.image_url : null

  const containerStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    backgroundImage: bgImage ? `url(${bgImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }

  const showText = liveState && !liveState.is_blank && !imageUrl && liveState.slide?.text
  const text = normalizeForDisplay(liveState?.slide?.text ?? '')
  const fontFamily = liveState?.slide?.font_family ?? settings?.font_family ?? 'Georgia, serif'
  const maxFontSize = settings?.font_size_px ?? 48

  const fontSize = useAutoFitFontSize(stageRef, textRef, maxFontSize, text, fontFamily)

  const textStyle: React.CSSProperties = {
    fontFamily,
    fontSize: `${fontSize}px`,
    textAlign: settings?.text_align ?? 'center',
    color: settings?.text_color ?? '#FFFFFF',
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center" style={containerStyle}>
      {imageUrl ? (
        <img
          key={imageUrl}
          src={resolveImageUrl(imageUrl)}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <div ref={stageRef} className="flex h-[90vh] w-[92vw] items-center justify-center overflow-hidden">
          {showText && (
            <div ref={textRef} style={textStyle}>
              {parseFormattedText(text)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
