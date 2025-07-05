'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Image, TrendingUp, Loader2, BarChart3, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AIAnalyticsData {
  insights: string[];
  imageAnalyses: Array<{
    products_detected: number;
    shelf_occupancy: number;
    visual_quality_score?: number;
  }>;
  predictions?: any[];
}

interface ForecastData {
  date: string;
  predicted: number;
  actual?: number;
  confidence?: number;
}

interface AnalyticsMetrics {
  salesPrediction: { value: number; confidence: number; unit: string };
  stockLevels: { value: number; status: string; unit: string };
  stockoutRisk: { probability: number; timeline: string };
  salesVolume: { value: number; trend: string; unit: string };
  accuracy: { sales: number; inventory: number; overall: number };
}

export default function AIAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AIAnalyticsData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[] | null>(null);
  const [forecastInsights, setForecastInsights] = useState<string[]>([]);
  const [forecastAccuracy, setForecastAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);

  // Mock data for demonstration
  const mockAnalyticsData = {
    salesQuantity: { prediction: 150, confidence: 30, factors: ["key_factors", "Lack of external factors (seasonality, promotions)"] },
    stockLevels: { prediction: 100, status: "optimal", recommendation: "recommendations" },
    stockoutRisk: { probability: 10, timeline: "2-3 weeks", preventionActions: ["Increase Stock Levels Immediately", "Monitor Stock Levels Closely"] },
    salesVolume: { prediction: 1000, trend: "increasing", seasonalFactors: ["Incorporate external factors (seasonality, promotions, marketing campaigns) into a predictive sales model to better manage inventory."] },
    accuracy: { salesModel: 85, inventoryModel: 85, overallAccuracy: 85 }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const data = mockAnalyticsData;

      // Transform to metrics format
      const transformedMetrics: AnalyticsMetrics = {
        salesPrediction: {
          value: data.salesQuantity.prediction,
          confidence: data.salesQuantity.confidence,
          unit: 'units'
        },
        stockLevels: {
          value: data.stockLevels.prediction,
          status: data.stockLevels.status,
          unit: 'units'
        },
        stockoutRisk: {
          probability: data.stockoutRisk.probability,
          timeline: data.stockoutRisk.timeline
        },
        salesVolume: {
          value: data.salesVolume.prediction,
          trend: data.salesVolume.trend,
          unit: 'units'
        },
        accuracy: {
          sales: data.accuracy.salesModel,
          inventory: data.accuracy.inventoryModel,
          overall: data.accuracy.overallAccuracy
        }
      };

      setMetrics(transformedMetrics);

      // Create forecast data
      const forecastPoints: ForecastData[] = [
        {
          date: '2025-07-05',
          predicted: data.salesQuantity.prediction,
          confidence: data.salesQuantity.confidence,
          actual: 140
        },
        {
          date: '2025-07-12',
          predicted: data.salesVolume.prediction,
          confidence: 75,
          actual: 950
        },
        {
          date: '2025-07-19',
          predicted: 1200,
          confidence: 70
        },
        {
          date: '2025-07-26',
          predicted: 1350,
          confidence: 65
        }
      ];

      setForecastData(forecastPoints);
      setForecastInsights([
        "Seasonal uptrend expected in Q3",
        "Marketing campaign impact projected",
        "Inventory optimization recommended"
      ]);
      setForecastAccuracy(85);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');

      // Simulate image analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockImageAnalysis = {
        products_detected: 15,
        shelf_occupancy: 78,
        visual_quality_score: 8.5
      };

      setAnalyticsData(prev => ({
        ...(prev || { insights: [], imageAnalyses: [] }),
        imageAnalyses: [...(prev?.imageAnalyses || []), mockImageAnalysis]
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'optimal': return 'text-green-600';
      case 'low': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskColor = (probability: number) => {
    if (probability < 20) return 'text-green-600';
    if (probability < 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Key Metrics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !metrics ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading metrics...</span>
            </div>
          ) : metrics ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Metric</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Value</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Status/Trend</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Sales Prediction</td>
                    <td className="border border-gray-300 px-4 py-2">{metrics.salesPrediction.value} {metrics.salesPrediction.unit}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Forecasted</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{metrics.salesPrediction.confidence}%</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-medium">Stock Levels</td>
                    <td className="border border-gray-300 px-4 py-2">{metrics.stockLevels.value} {metrics.stockLevels.unit}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-sm capitalize ${getStatusColor(metrics.stockLevels.status)}`}>
                        {metrics.stockLevels.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">-</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Stockout Risk</td>
                    <td className="border border-gray-300 px-4 py-2">{metrics.stockoutRisk.probability}%</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`font-medium ${getRiskColor(metrics.stockoutRisk.probability)}`}>
                        {metrics.stockoutRisk.timeline}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">High</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-medium">Sales Volume</td>
                    <td className="border border-gray-300 px-4 py-2">{metrics.salesVolume.value} {metrics.salesVolume.unit}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-sm capitalize ${getTrendColor(metrics.salesVolume.trend)}`}>
                        {metrics.salesVolume.trend}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">75%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No metrics available</p>
          )}
        </CardContent>
      </Card>

      {/* Model Accuracy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Model Accuracy
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Model Type</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Accuracy</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Sales Model</td>
                    <td className="border border-gray-300 px-4 py-2">{metrics.accuracy.sales}%</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${metrics.accuracy.sales}%` }}></div>
                        </div>
                        <span className="text-sm text-green-600">Excellent</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-medium">Inventory Model</td>
                    <td className="border border-gray-300 px-4 py-2">{metrics.accuracy.inventory}%</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${metrics.accuracy.inventory}%` }}></div>
                        </div>
                        <span className="text-sm text-green-600">Excellent</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Overall Model</td>
                    <td className="border border-gray-300 px-4 py-2">{metrics.accuracy.overall}%</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${metrics.accuracy.overall}%` }}></div>
                        </div>
                        <span className="text-sm text-green-600">Excellent</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shelf Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Shelf Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button asChild variant="outline" disabled={loading}>
                <label className="cursor-pointer">
                  {loading ? 'Analyzing...' : 'Upload Shelf Image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={loading}
                  />
                </label>
              </Button>

              {analyticsData?.imageAnalyses?.[0] && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Metric</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-medium">Products Detected</td>
                        <td className="border border-gray-300 px-3 py-2">{analyticsData.imageAnalyses[0].products_detected}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 font-medium">Shelf Occupancy</td>
                        <td className="border border-gray-300 px-3 py-2">{analyticsData.imageAnalyses[0].shelf_occupancy}%</td>
                      </tr>
                      {analyticsData.imageAnalyses[0].visual_quality_score && (
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">Quality Score</td>
                          <td className="border border-gray-300 px-3 py-2">{analyticsData.imageAnalyses[0].visual_quality_score}/10</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Forecast Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Forecast Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {forecastInsights.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Insight</th>
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastInsights.map((insight, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-3 py-2">{insight}</td>
                        <td className="border border-gray-300 px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            i === 0 ? 'bg-red-100 text-red-800' :
                            i === 1 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {i === 0 ? 'High' : i === 1 ? 'Medium' : 'Low'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No insights available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Forecast
            {forecastAccuracy !== null && (
              <span className="text-sm text-gray-500">
                (Accuracy: {forecastAccuracy.toFixed(1)}%)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !forecastData ? (
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : forecastData && forecastData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      name="Predicted Sales"
                    />
                    {forecastData.some(item => item.actual !== undefined) && (
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#82ca9d"
                        name="Actual Sales"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Forecast Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Date</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Predicted</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Actual</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Confidence</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData.map((item, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2">{item.date}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.predicted}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {item.actual !== undefined ? item.actual : '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{item.confidence}%</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {item.actual !== undefined ?
                            <span className={`${
                              Math.abs(item.predicted - item.actual) / item.actual > 0.1 ?
                              'text-red-600' : 'text-green-600'
                            }`}>
                              {((item.predicted - item.actual) / item.actual * 100).toFixed(1)}%
                            </span> : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No forecast data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
