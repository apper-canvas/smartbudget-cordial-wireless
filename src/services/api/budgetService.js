import { toast } from "react-toastify"

class BudgetService {
  constructor() {
    this.tableName = 'budget_c'
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
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "spent_c"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "alert_threshold_c"}},
          {"field": {"Name": "alert_methods_c"}},
          {"field": {"Name": "category_c"}}
        ],
        orderBy: [{"fieldName": "month_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error("Failed to fetch budgets:", response.message)
        toast.error(response.message)
        return []
      }

      if (!response.data || response.data.length === 0) {
        return []
      }

      // Transform database fields to UI format
      return response.data.map(budget => ({
        Id: budget.Id,
        monthlyLimit: budget.monthly_limit_c,
        spent: budget.spent_c || 0,
        month: budget.month_c,
        alertThreshold: budget.alert_threshold_c || 80,
        alertMethods: budget.alert_methods_c ? budget.alert_methods_c.split(',') : ["email", "push"],
        category: budget.category_c?.Name || budget.category_c
      }))
    } catch (error) {
      console.error("Error fetching budgets:", error?.response?.data?.message || error)
      return []
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "spent_c"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "alert_threshold_c"}},
          {"field": {"Name": "alert_methods_c"}},
          {"field": {"Name": "category_c"}}
        ]
      }
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params)
      
      if (!response.success) {
        console.error("Failed to fetch budget:", response.message)
        toast.error(response.message)
        return null
      }

      if (!response.data) {
        return null
      }

      // Transform database fields to UI format
      const budget = response.data
      return {
        Id: budget.Id,
        monthlyLimit: budget.monthly_limit_c,
        spent: budget.spent_c || 0,
        month: budget.month_c,
        alertThreshold: budget.alert_threshold_c || 80,
        alertMethods: budget.alert_methods_c ? budget.alert_methods_c.split(',') : ["email", "push"],
        category: budget.category_c?.Name || budget.category_c
      }
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error?.response?.data?.message || error)
      return null
    }
  }

  async create(budgetData) {
    try {
      // Transform UI fields to database format - only Updateable fields
      const dbData = {
        Name: `${budgetData.category} Budget - ${budgetData.month}`,
        monthly_limit_c: parseFloat(budgetData.monthlyLimit),
        spent_c: parseFloat(budgetData.spent || 0),
        month_c: budgetData.month,
        alert_threshold_c: parseInt(budgetData.alertThreshold || 80),
        alert_methods_c: Array.isArray(budgetData.alertMethods) ? budgetData.alertMethods.join(',') : budgetData.alertMethods,
        category_c: parseInt(budgetData.category_c) || null
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
          console.error(`Failed to create ${failed.length} budget:`, JSON.stringify(failed))
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          const created = successful[0].data
          // Transform back to UI format
          return {
            Id: created.Id,
            monthlyLimit: created.monthly_limit_c,
            spent: created.spent_c || 0,
            month: created.month_c,
            alertThreshold: created.alert_threshold_c || 80,
            alertMethods: created.alert_methods_c ? created.alert_methods_c.split(',') : ["email", "push"],
            category: created.category_c?.Name || created.category_c
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error creating budget:", error?.response?.data?.message || error)
      return null
    }
  }

  async update(id, budgetData) {
    try {
      // Transform UI fields to database format - only Updateable fields
      const dbData = {
        Id: parseInt(id),
        monthly_limit_c: parseFloat(budgetData.monthlyLimit),
        spent_c: parseFloat(budgetData.spent || 0),
        month_c: budgetData.month,
        alert_threshold_c: parseInt(budgetData.alertThreshold || 80),
        alert_methods_c: Array.isArray(budgetData.alertMethods) ? budgetData.alertMethods.join(',') : budgetData.alertMethods,
        category_c: parseInt(budgetData.category_c) || null
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
          console.error(`Failed to update ${failed.length} budget:`, JSON.stringify(failed))
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          const updated = successful[0].data
          // Transform back to UI format
          return {
            Id: updated.Id,
            monthlyLimit: updated.monthly_limit_c,
            spent: updated.spent_c || 0,
            month: updated.month_c,
            alertThreshold: updated.alert_threshold_c || 80,
            alertMethods: updated.alert_methods_c ? updated.alert_methods_c.split(',') : ["email", "push"],
            category: updated.category_c?.Name || updated.category_c
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error updating budget:", error?.response?.data?.message || error)
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
          console.error(`Failed to delete ${failed.length} budget:`, JSON.stringify(failed))
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        return successful.length > 0
      }
      return false
    } catch (error) {
      console.error("Error deleting budget:", error?.response?.data?.message || error)
      return false
    }
  }
}

export const budgetService = new BudgetService()