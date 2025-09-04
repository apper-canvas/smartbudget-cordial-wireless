import { toast } from "react-toastify"

class TransactionService {
  constructor() {
    this.tableName = 'transaction_c'
    this.apperClient = null
    this.initializeClient()
  }

  initializeClient() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error("Failed to fetch transactions:", response.message)
        toast.error(response.message)
        return []
      }

      if (!response.data || response.data.length === 0) {
        return []
      }

      // Transform database fields to UI format
return response.data.map(transaction => ({
        Id: transaction.Id,
        name: transaction.Name || "",
        type: transaction.type_c,
        amount: transaction.amount_c,
        date: transaction.date_c,
        description: transaction.description_c || "",
        category: transaction.category_c?.Name || transaction.category_c
      }))
    } catch (error) {
      console.error("Error fetching transactions:", error?.response?.data?.message || error)
      return []
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}}
        ]
      }
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params)
      
      if (!response.success) {
        console.error("Failed to fetch transaction:", response.message)
        toast.error(response.message)
        return null
      }

      if (!response.data) {
        return null
      }

      // Transform database fields to UI format
      const transaction = response.data
return {
        Id: transaction.Id,
        name: transaction.Name || "",
        type: transaction.type_c,
        amount: transaction.amount_c,
        date: transaction.date_c,
        description: transaction.description_c || "",
        category: transaction.category_c?.Name || transaction.category_c
      }
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error?.response?.data?.message || error)
      return null
    }
  }

  async create(transactionData) {
    try {
      // Transform UI fields to database format - only Updateable fields
const dbData = {
        Name: transactionData.name || transactionData.description || `${transactionData.type} - ${transactionData.amount}`,
        type_c: transactionData.type,
        amount_c: parseFloat(transactionData.amount),
        date_c: transactionData.date,
        description_c: transactionData.description || "",
        category_c: parseInt(transactionData.category_c) || null
      }

      const params = {
        records: [dbData]
      }
      
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} transaction:`, JSON.stringify(failed))
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          const created = successful[0].data
          // Transform back to UI format
          return {
Id: created.Id,
            name: created.Name || "",
            type: created.type_c,
            amount: created.amount_c,
            date: created.date_c,
            description: created.description_c || "",
            category: created.category_c?.Name || created.category_c
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error creating transaction:", error?.response?.data?.message || error)
      return null
    }
  }

  async update(id, transactionData) {
    try {
      // Transform UI fields to database format - only Updateable fields
      const dbData = {
Id: parseInt(id),
        Name: transactionData.name || transactionData.description || `${transactionData.type} - ${transactionData.amount}`,
        type_c: transactionData.type,
        amount_c: parseFloat(transactionData.amount),
        date_c: transactionData.date,
        description_c: transactionData.description || "",
        category_c: parseInt(transactionData.category_c) || null
      }
      const params = {
        records: [dbData]
      }
      
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} transaction:`, JSON.stringify(failed))
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          const updated = successful[0].data
          // Transform back to UI format
          return {
            Id: updated.Id,
name: updated.Name || "",
            type: updated.type_c,
            amount: updated.amount_c,
            date: updated.date_c,
            description: updated.description_c || "",
            category: updated.category_c?.Name || updated.category_c
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error updating transaction:", error?.response?.data?.message || error)
      return null
    }
  }

  async delete(id) {
    try {
      const params = { 
        RecordIds: [parseInt(id)]
      }
      
      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} transaction:`, JSON.stringify(failed))
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        return successful.length > 0
      }
      return false
    } catch (error) {
      console.error("Error deleting transaction:", error?.response?.data?.message || error)
      return false
    }
  }
}

export const transactionService = new TransactionService()