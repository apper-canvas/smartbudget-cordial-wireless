import { toast } from "react-toastify"

class CategoryService {
  constructor() {
    this.tableName = 'category_c'
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
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "color_c"}}
        ],
        pagingInfo: {"limit": 100, "offset": 0}
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error("Failed to fetch categories:", response.message)
        toast.error(response.message)
        return []
      }

      if (!response.data || response.data.length === 0) {
        return []
      }

      // Transform database fields to UI format
      return response.data.map(category => ({
        Id: category.Id,
        name: category.name_c || category.Name,
        type: category.type_c,
        icon: category.icon_c,
        color: category.color_c
      }))
    } catch (error) {
      console.error("Error fetching categories:", error?.response?.data?.message || error)
      return []
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "color_c"}}
        ]
      }
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params)
      
      if (!response.success) {
        console.error("Failed to fetch category:", response.message)
        toast.error(response.message)
        return null
      }

      if (!response.data) {
        return null
      }

      // Transform database fields to UI format
      const category = response.data
      return {
        Id: category.Id,
        name: category.name_c || category.Name,
        type: category.type_c,
        icon: category.icon_c,
        color: category.color_c
      }
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error?.response?.data?.message || error)
      return null
    }
  }

  async getByType(type) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "color_c"}}
        ],
        where: [{"FieldName": "type_c", "Operator": "EqualTo", "Values": [type]}],
        pagingInfo: {"limit": 100, "offset": 0}
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error("Failed to fetch categories by type:", response.message)
        return []
      }

      if (!response.data || response.data.length === 0) {
        return []
      }

      // Transform database fields to UI format
      return response.data.map(category => ({
        Id: category.Id,
        name: category.name_c || category.Name,
        type: category.type_c,
        icon: category.icon_c,
        color: category.color_c
      }))
    } catch (error) {
      console.error("Error fetching categories by type:", error?.response?.data?.message || error)
      return []
    }
  }
}

export const categoryService = new CategoryService()