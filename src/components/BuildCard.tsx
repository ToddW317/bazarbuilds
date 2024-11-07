'use client'

import { Build } from '@/types/types'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { toggleBuildLike } from '@/lib/buildService'
import { useState } from 'react'
import { HEROES } from '@/config/heroes'
import { Eye, Heart } from 'lucide-react'
import Icon from '@/components/ui/Icon'

interface BuildCardProps {
  build: Build
}

const HERO_STYLES = {
  vanessa: {
    gradient: 'bg-gradient-to-r from-red-900 to-gray-900',
    border: 'border-red-700',
    text: 'text-red-400'
  },
  dooley: {
    gradient: 'bg-gradient-to-r from-gray-700 via-blue-900 to-gray-800',
    border: 'border-blue-700',
    text: 'text-blue-400'
  },
  pygmalien: {
    gradient: 'bg-gradient-to-r from-purple-900 to-orange-900',
    border: 'border-orange-700',
    text: 'text-orange-400'
  }
}

export default function BuildCard({ build }: BuildCardProps) {
  if (!build) return null

  const { user } = useAuth()
  const likedBy = build?.likedBy || []
  const [isLiked, setIsLiked] = useState(user ? likedBy.includes(user.uid) : false)
  const [likeCount, setLikeCount] = useState(build?.likes || 0)
  const hero = HEROES.find(h => h.id === build.heroId)
  const heroStyle = HERO_STYLES[build.heroId as keyof typeof HERO_STYLES]

  const handleLike = async () => {
    if (!user) return

    try {
      const liked = await toggleBuildLike(build.id, user.uid)
      setIsLiked(liked)
      setLikeCount(prev => Math.max(0, liked ? prev + 1 : prev - 1))
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  return (
    <Link href={`/builds/${build.id}`}>
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-700 h-[360px] flex flex-col">
        {/* Screenshot Preview - Fixed height */}
        <div className="relative h-48 flex-shrink-0">
          {build.screenshots?.[0] ? (
            <Image
              src={build.screenshots[0]}
              alt={build.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">No screenshot</span>
            </div>
          )}
          {/* Hero Indicator */}
          <div className={`absolute bottom-0 left-0 right-0 ${heroStyle.gradient} p-2 bg-opacity-90`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${heroStyle.border} bg-gray-900`} />
              <p className={`text-sm font-medium ${heroStyle.text}`}>
                {hero?.name || 'Unknown Hero'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Container - Flex grow to fill space */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Build Info */}
          <div className="flex items-start justify-between mb-auto">
            <div>
              <h3 className="font-bold text-lg mb-1 truncate text-white">{build.title}</h3>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              build.buildType === 'Aggro' ? 'bg-red-900 text-red-200' :
              build.buildType === 'Shield' ? 'bg-blue-900 text-blue-200' :
              'bg-green-900 text-green-200'
            }`}>
              {build.buildType}
            </span>
          </div>

          {/* Tags Container - Fixed height with overflow hidden */}
          <div className="h-[40px] overflow-hidden my-2">
            {build.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {build.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Metadata section */}
          <div className="flex items-center justify-between text-sm text-gray-400 mt-auto pt-2 border-t border-gray-700">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 ${
                  isLiked ? 'text-red-400' : 'hover:text-red-400'
                } transition-colors`}
              >
                <Icon icon={Heart} className="w-4 h-4" />
                <span>{likeCount}</span>
              </button>
              <span className="flex items-center">
                <Icon icon={Eye} className="w-4 h-4 mr-1" />
                <span>{build.views || 0}</span>
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-300">{build.creatorName || 'Anonymous'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
} 