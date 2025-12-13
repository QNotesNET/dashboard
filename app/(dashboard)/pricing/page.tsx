import React from 'react'
import PricingClient from './PricingClient'
import { getCurrentUser } from '@/lib/session'

const PricingPage = async () =>
{
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user-id";
  return (
    <>
      <PricingClient userId={userId} />
    </>
  )
}

export default PricingPage