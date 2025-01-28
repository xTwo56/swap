'use client'

import { getSwapProgram, getSwapProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { sign } from 'crypto'
import { error } from 'console'

interface CreateEntryArgs {
  title: string,
  message: string,
  owner: PublicKey
}

interface UpdateEntryArgs extends CreateEntryArgs { }

export function useSwapProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getSwapProgramId(cluster.network as Cluster), [cluster])
  const program = getSwapProgram(provider)


  const accounts = useQuery({
    queryKey: ['swap', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ["journalEntry", 'create', { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      return program.methods.createJournalEntry(title, message).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      accounts.refetch()
    },
    onError: (error) => {
      transactionToast(error.message)
    }
  })

  return {
    program,
    programId,
    accounts,
    createEntry,
    getProgramAccount,
  }
}

export function useSwapProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useSwapProgram()

  const accountQuery = useQuery({
    queryKey: ['swap', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  })

  const updateEntry = useMutation<string, Error, UpdateEntryArgs>({

    mutationKey: ['journalEntry', 'update', { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      return program.methods.updateJournalEntry(title, message).rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      accounts.refetch()
    },
    onError: (error) => {
      transactionToast(error.message)
    }
  })

  const deleteEntry = useMutation({
    mutationKey: ['journalEntry', 'delete', { cluster }],
    mutationFn: async (title: string) => {
      return program.methods.deleteJournalEntry(title).rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      accounts.refetch()
    },
    onError: (error) => {
      transactionToast(error.message)
    }
  })

  return {
    accountQuery,
    updateEntry,
    deleteEntry
  }
}
