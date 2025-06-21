"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDesignPairById } from '@/lib/designs'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testDesignPair = async () => {
    setLoading(true)
    setTestResult('Testing...')
    
    try {
      const designPairId = '00a14b30-305a-4976-ab9f-a5e8df89c779'
      console.log('Testing design pair ID:', designPairId)
      
      // Test direct Supabase query
      const { data, error } = await supabase
        .from('design_pairs')
        .select('*')
        .eq('id', designPairId)
        .single()
      
      if (error) {
        setTestResult(`Supabase Error: ${error.message}`)
        console.error('Supabase error:', error)
      } else {
        setTestResult(`Found design pair: ${JSON.stringify(data, null, 2)}`)
        console.log('Design pair data:', data)
      }
      
      // Test our function
      const designPair = await getDesignPairById(designPairId)
      console.log('Function result:', designPair)
      
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Test error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testFullDesignPair = async () => {
    setLoading(true)
    setTestResult('Testing full design pair with joins...')
    
    try {
      const designPairId = '00a14b30-305a-4976-ab9f-a5e8df89c779'
      console.log('Testing full design pair query for ID:', designPairId)
      
      // Test the full query with joins
      const { data, error } = await supabase
        .from('design_pairs')
        .select(`
          *,
          design_a:designs!design_a_id(*),
          design_b:designs!design_b_id(*),
          ratings(*)
        `)
        .eq('id', designPairId)
        .single()
      
      if (error) {
        setTestResult(`Full Query Error: ${error.message}`)
        console.error('Full query error:', error)
      } else {
        setTestResult(`Full design pair with joins: ${JSON.stringify(data, null, 2)}`)
        console.log('Full design pair data:', data)
      }
      
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Full test error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testAllDesignPairs = async () => {
    setLoading(true)
    setTestResult('Testing all design pairs...')
    
    try {
      const { data, error } = await supabase
        .from('design_pairs')
        .select('*')
        .limit(5)
      
      if (error) {
        setTestResult(`Error fetching design pairs: ${error.message}`)
      } else {
        setTestResult(`Found ${data?.length || 0} design pairs: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testIndividualDesigns = async () => {
    setLoading(true)
    setTestResult('Testing individual designs...')
    
    try {
      // Test design A
      const designAId = '93ff4552-456f-445c-983d-df0b3f986c8b'
      const { data: designA, error: errorA } = await supabase
        .from('designs')
        .select('*')
        .eq('id', designAId)
        .single()
      
      // Test design B
      const designBId = '36af475e-c835-46f0-bf66-fc235c8ed37c'
      const { data: designB, error: errorB } = await supabase
        .from('designs')
        .select('*')
        .eq('id', designBId)
        .single()
      
      if (errorA || errorB) {
        setTestResult(`Design Error: A=${errorA?.message || 'OK'}, B=${errorB?.message || 'OK'}`)
      } else {
        setTestResult(`Design A: ${JSON.stringify(designA, null, 2)}\n\nDesign B: ${JSON.stringify(designB, null, 2)}`)
      }
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Database Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Basic Design Pair</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testDesignPair} disabled={loading} className="w-full">
                {loading ? 'Testing...' : 'Test Basic Design Pair'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Full Design Pair</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testFullDesignPair} disabled={loading} className="w-full">
                {loading ? 'Testing...' : 'Test Full Design Pair with Joins'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Individual Designs</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testIndividualDesigns} disabled={loading} className="w-full">
                {loading ? 'Testing...' : 'Test Individual Designs'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test All Design Pairs</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testAllDesignPairs} disabled={loading} className="w-full">
                {loading ? 'Testing...' : 'Test All Design Pairs'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {testResult && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
                {testResult}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 