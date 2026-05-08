'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { Film } from 'lucide-react'

type MovieImageProps = Omit<ImageProps, 'onError'> & {
  fallbackClassName?: string
}

export function MovieImage({ fallbackClassName, className, ...props }: MovieImageProps) {
  const [broken, setBroken] = useState(false)

  if (broken) {
    return (
      <div className={`w-full h-full bg-[#1a1a1a] flex flex-col items-center justify-center gap-2 ${fallbackClassName ?? ''}`}>
        <Film className="h-8 w-8 text-gray-700" />
        <span className="text-gray-700 text-xs">No image</span>
      </div>
    )
  }

  return (
    <Image
      {...props}
      className={className}
      onError={() => setBroken(true)}
    />
  )
}
