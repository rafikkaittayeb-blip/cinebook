'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, Gift, TrendingUp, Zap, ArrowRight, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function LoyaltyPage() {
  const { user } = useAuth()
  const [redeemed, setRedeemed] = useState<string | null>(null)
  const [redeeming, setRedeeming] = useState<string | null>(null)

  const points = user?.loyaltyPoints ?? 350

  const rewards = [
    { id: 'free-ticket', name: 'Free Movie Ticket', points: 500, icon: Zap, desc: 'One standard seat on any movie' },
    { id: 'concession', name: 'EGP 50 Concession Voucher', points: 300, icon: Gift, desc: 'Valid at any CineBook counter' },
    { id: 'priority', name: 'Priority Booking — 1 Month', points: 200, icon: TrendingUp, desc: 'Book before everyone else' },
  ]

  const transactions = [
    { id: 1, type: 'earned', description: 'Booking — Dune: Part Two', points: 180, date: '2026-04-10' },
    { id: 2, type: 'earned', description: 'Booking — Oppenheimer', points: 190, date: '2026-03-28' },
    { id: 3, type: 'redeemed', description: 'Priority Booking Reward', points: -200, date: '2026-03-15' },
    { id: 4, type: 'earned', description: 'Welcome Bonus', points: 180, date: '2026-03-01' },
  ]

  const handleRedeem = (rewardId: string) => {
    setRedeeming(rewardId)
    setTimeout(() => {
      setRedeeming(null)
      setRedeemed(rewardId)
      setTimeout(() => setRedeemed(null), 3000)
    }, 1200)
  }

  const tierInfo = points >= 1000
    ? { tier: 'Gold', next: null, nextAt: null, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' }
    : points >= 500
    ? { tier: 'Silver', next: 'Gold', nextAt: 1000, color: 'text-gray-300', bg: 'bg-gray-500/10 border-gray-500/30' }
    : { tier: 'Bronze', next: 'Silver', nextAt: 500, color: 'text-amber-700', bg: 'bg-amber-900/10 border-amber-900/30' }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-[#1a1a1a] bg-[#0d0d0d] py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Loyalty Rewards</h1>
              <p className="text-gray-500 text-sm mt-0.5">Every booking earns you points</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5">
              <p className="text-gray-500 text-xs mb-1">Available Points</p>
              <p className="text-4xl font-serif font-bold text-yellow-500">{points}</p>
              <p className="text-gray-600 text-xs mt-1">Ready to redeem</p>
            </div>
            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5">
              <p className="text-gray-500 text-xs mb-1">This Month</p>
              <p className="text-3xl font-bold text-white">370</p>
              <p className="text-gray-600 text-xs mt-1">Points earned</p>
            </div>
            <div className={`bg-[#111] border rounded-xl p-5 ${tierInfo.bg}`}>
              <p className="text-gray-500 text-xs mb-1">Membership</p>
              <p className={`text-2xl font-bold ${tierInfo.color}`}>{tierInfo.tier} Member</p>
              <p className="text-gray-600 text-xs mt-1">
                {tierInfo.next ? `${tierInfo.nextAt! - points} pts to ${tierInfo.next}` : 'Top tier!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-serif font-bold text-white">How It Works</h2>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Book a movie', desc: 'Every EGP 10 spent earns you 10 loyalty points automatically' },
                  { step: '2', title: 'Stack your points', desc: 'They add up after every purchase and never expire' },
                  { step: '3', title: 'Redeem for rewards', desc: 'Free tickets, vouchers, priority access and more' },
                ].map(item => (
                  <div key={item.step} className="flex gap-4">
                    <div className="h-9 w-9 rounded-full bg-yellow-500 text-black font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{item.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-serif font-bold text-white">Available Rewards</h2>
              {rewards.map(reward => {
                const Icon = reward.icon
                const canRedeem = points >= reward.points
                const isRedeeming = redeeming === reward.id
                const isRedeemed = redeemed === reward.id

                return (
                  <div key={reward.id} className={`bg-[#111] border rounded-xl p-5 flex items-center justify-between transition-all ${canRedeem ? 'border-[#2a2a2a] hover:border-yellow-500/30' : 'border-[#1e1e1e] opacity-60'}`}>
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <Icon className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{reward.name}</p>
                        <p className="text-gray-600 text-xs mt-0.5">{reward.desc}</p>
                        <p className="text-yellow-500 font-bold text-sm mt-1">{reward.points} pts</p>
                      </div>
                    </div>
                    <button
                      onClick={() => canRedeem && handleRedeem(reward.id)}
                      disabled={!canRedeem || isRedeeming}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                        isRedeemed
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : canRedeem && !isRedeeming
                          ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                          : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed border border-[#2a2a2a]'
                      }`}
                    >
                      {isRedeemed ? (
                        <><CheckCircle className="h-4 w-4" /> Redeemed!</>
                      ) : isRedeeming ? (
                        <><div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" /> Redeeming...</>
                      ) : (
                        <>Redeem <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-serif font-bold text-white">Membership Tiers</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { name: 'Bronze', min: '0', benefits: ['1pt per EGP 10', 'Birthday bonus', 'Exclusive offers'], current: tierInfo.tier === 'Bronze' },
                  { name: 'Silver', min: '500', benefits: ['1.5pts per EGP 10', 'Priority support', '10% discount'], current: tierInfo.tier === 'Silver' },
                  { name: 'Gold', min: '1,000', benefits: ['2pts per EGP 10', 'VIP support', '15% discount', 'Free monthly ticket'], current: tierInfo.tier === 'Gold' },
                ].map(tier => (
                  <div key={tier.name} className={`rounded-xl p-4 border-2 transition-all ${tier.current ? 'border-yellow-500 bg-yellow-500/5' : 'border-[#2a2a2a] bg-[#111]'}`}>
                    {tier.current && (
                      <span className="inline-block px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full mb-2">Current</span>
                    )}
                    <h3 className="font-serif font-bold text-white mb-0.5">{tier.name}</h3>
                    <p className="text-gray-600 text-xs mb-3">{tier.min === '0' ? 'Starting tier' : `${tier.min}+ points`}</p>
                    <ul className="space-y-1">
                      {tier.benefits.map(b => (
                        <li key={b} className="text-xs text-gray-400 flex items-start gap-1.5">
                          <span className="text-yellow-500 mt-0.5">✓</span> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#111] border border-[#2a2a2a] rounded-xl p-5 space-y-4">
              <h2 className="text-lg font-serif font-bold text-white">Transaction History</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {transactions.map(tx => (
                  <div key={tx.id} className="pb-3 border-b border-[#1e1e1e] last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm text-white line-clamp-1 pr-2">{tx.description}</p>
                      <span className={`text-sm font-bold flex-shrink-0 ${tx.type === 'earned' ? 'text-yellow-500' : 'text-red-400'}`}>
                        {tx.type === 'earned' ? '+' : ''}{tx.points}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                ))}
              </div>
              <Link href="/my-bookings" className="block w-full text-center py-2 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-colors text-sm font-medium">
                View All Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}