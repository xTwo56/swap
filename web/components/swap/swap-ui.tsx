'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useSwapProgram, useSwapProgramAccount } from './swap-data-access'
import { useWallet } from '@solana/wallet-adapter-react'

export function SwapCreate() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const { createEntry } = useSwapProgram()
  const { publicKey } = useWallet()

  const isFormValid = title.trim() && message.trim()

  const handleSumbit = () => {
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({ title, message, owner: publicKey })
    }
  }

  if (!publicKey) {
    return (
      <p>Connect your wallet</p>
    )
  }
  return (
    <div>

      <input type="text" placeholder='title' value={title}
        className='input input-bordered w-full max-w-xs'
        onChange={(e) => setTitle(e.target.value)} />

      <textarea placeholder='message' value={message}
        className='textarea tesxtarea-bordered w-full max-w-xs'
        onChange={(e) => setMessage(e.target.value)} />

      <button onClick={handleSumbit}
        disabled={createEntry.isPending || !isFormValid}
        className='btn btn-xs lg: btn-md btn-primary' />

    </div>
  )
}

export function SwapList() {
  const { accounts, getProgramAccount } = useSwapProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <SwapCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function SwapCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useSwapProgramAccount({
    account,
  })


  const [message, setMessage] = useState("")
  const title = accountQuery.data?.title

  if (!title) return

  const { publicKey } = useWallet()
  const isFormValid = title.trim()

  const handleSumbit = () => {
    if (publicKey && isFormValid) {
      updateEntry.mutateAsync({ title, message, owner: publicKey })
    }
  }
  if (!publicKey) {
    return (
      <p>Connect your wallet</p>
    )
  }

  return accountQuery.isLoading ? (
    <span>loading</span>
  ) : (
    <div className='card card-bordered border-base-300 border-4 text-neutral-content'>
      <div className='card-body items-center text-center'>

        {/* <h2 onClick={accountQuery.refetch()}>{accountQuery.data?.title}</h2> */}
        <p>{accountQuery.data?.message}</p>
        <textarea
          placeholder='message'
          onChange={(e) => e.target.value}
          value={message}
          className='textarea tesxtarea-bordered w-fulla max-w-xs'
        ></textarea>

      </div>
      <button onClick={handleSumbit}
        disabled={updateEntry.isPending || !isFormValid}
        className="btn btn-xs lg:btn-md btn-primary">
        Update</button>
      <button
        onClick={() => {
          const title = accountQuery.data?.title
          if (title) {
            return deleteEntry.mutateAsync(title)
          }
        }
        }
        disabled={deleteEntry.isPending}
        className='btn btn-xs lg:btn-md btn-error'>
        Delete</button>
    </div >
  )
}

