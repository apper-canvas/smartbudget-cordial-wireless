import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import Card from "@/components/atoms/Card"
import CategoryIcon from "@/components/molecules/CategoryIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { transactionService } from "@/services/api/transactionService"
import { formatCurrency } from "@/utils/currency"
import { formatDate } from "@/utils/date"

const TransactionList = ({ refreshTrigger, onEdit }) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadTransactions()
  }, [refreshTrigger])

  const loadTransactions = async () => {
    try {
      setError("")
      const data = await transactionService.getAll()
      // Sort by date (newest first) then by Id
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        if (dateB.getTime() !== dateA.getTime()) {
          return dateB.getTime() - dateA.getTime()
        }
        return b.Id - a.Id
      })
      setTransactions(sortedData)
    } catch (err) {
      console.error("Failed to load transactions:", err)
      setError("Failed to load transactions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return
    }

    try {
      await transactionService.delete(id)
      setTransactions(prev => prev.filter(t => t.Id !== id))
      toast.success("Transaction deleted successfully!")
    } catch (err) {
      console.error("Failed to delete transaction:", err)
      toast.error("Failed to delete transaction. Please try again.")
    }
  }

  if (loading) {
    return <Loading message="Loading transactions..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadTransactions} />
  }

  if (transactions.length === 0) {
    return (
      <Empty
        title="No transactions yet"
        description="Start by adding your first income or expense transaction."
        actionLabel="Add Transaction"
        onAction={() => window.location.hash = "add-transaction"}
      />
    )
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <p className="text-sm text-gray-500 mt-1">
          {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.Id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CategoryIcon category={transaction.category} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
<p className="font-medium text-gray-900">{typeof transaction.category === 'string' ? transaction.category : transaction.category?.name || 'Other'}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === "income"
                          ? "bg-success text-green-800 bg-opacity-20"
                          : "bg-error text-red-800 bg-opacity-20"
                      }`}>
                        {transaction.type}
                      </span>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {transaction.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === "income" ? "text-success" : "text-error"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit && onEdit(transaction)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit transaction"
                    >
                      <ApperIcon name="Edit" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.Id)}
                      className="p-1.5 text-gray-400 hover:text-error hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete transaction"
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default TransactionList