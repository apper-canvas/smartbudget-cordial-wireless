import { toast } from "react-toastify"

class SavingsGoalService {
  constructor() {
    this.tableName = 'savings_goal_c'
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
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "target_amount_c"}},
          {"field": {"Name": "current_amount_c"}},
          {"field": {"Name": "deadline_c"}}
        ],
        orderBy: [{"fieldName": "deadline_c", "sorttype": "ASC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error("Failed to fetch savings goals:", response.message)
        toast.error(response.message)
        return []
      }

      if (!response.data || response.data.length === 0) {
        return []
      }

      // Transform database fields to UI format
      return response.data.map(goal => ({
        Id: goal.Id,
        name: goal.name_c || goal.Name,
        targetAmount: goal.target_amount_c,
        currentAmount: goal.current_amount_c,
        deadline: goal.deadline_c
      }))
    } catch (error) {
      console.error("Error fetching savings goals:", error?.response?.data?.message || error)
      return []
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "target_amount_c"}},
          {"field": {"Name": "current_amount_c"}},
          {"field": {"Name": "deadline_c"}}
        ]
      }
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params)
      
      if (!response.success) {
        console.error("Failed to fetch savings goal:", response.message)
        toast.error(response.message)
        return null
      }

      if (!response.data) {
        return null
      }

      // Transform database fields to UI format
      const goal = response.data
      return {
        Id: goal.Id,
        name: goal.name_c || goal.Name,
        targetAmount: goal.target_amount_c,
        currentAmount: goal.current_amount_c,
        deadline: goal.deadline_c
      }
    } catch (error) {
      console.error(`Error fetching savings goal ${id}:`, error?.response?.data?.message || error)
      return null
    }
  }

  async create(goalData) {
    try {
      // Transform UI fields to database format - only Updateable fields
      const dbData = {
        Name: goalData.name,
        name_c: goalData.name,
        target_amount_c: parseFloat(goalData.targetAmount),
        current_amount_c: parseFloat(goalData.currentAmount || 0),
        deadline_c: goalData.deadline
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
          console.error(`Failed to create ${failed.length} savings goal:`, JSON.stringify(failed))
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          const created = successful[0].data
          // Transform back to UI format
          return {
            Id: created.Id,
            name: created.name_c || created.Name,
            targetAmount: created.target_amount_c,
            currentAmount: created.current_amount_c,
            deadline: created.deadline_c
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error creating savings goal:", error?.response?.data?.message || error)
      return null
    }
  }

  async update(id, goalData) {
    try {
      // Transform UI fields to database format - only Updateable fields
      const dbData = {
        Id: parseInt(id),
        name_c: goalData.name,
        target_amount_c: parseFloat(goalData.targetAmount),
        current_amount_c: parseFloat(goalData.currentAmount || 0),
        deadline_c: goalData.deadline
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
          console.error(`Failed to update ${failed.length} savings goal:`, JSON.stringify(failed))
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          const updated = successful[0].data
          // Transform back to UI format
          return {
            Id: updated.Id,
            name: updated.name_c || updated.Name,
            targetAmount: updated.target_amount_c,
            currentAmount: updated.current_amount_c,
            deadline: updated.deadline_c
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error updating savings goal:", error?.response?.data?.message || error)
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
          console.error(`Failed to delete ${failed.length} savings goal:`, JSON.stringify(failed))
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        return successful.length > 0
      }
      return false
    } catch (error) {
      console.error("Error deleting savings goal:", error?.response?.data?.message || error)
      return false
    }
  }
}

export const savingsGoalService = new SavingsGoalService()