'use client';
import { useState, useEffect, useCallback } from 'react';
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

// Type Definitions
interface SalesQuantityPrediction {
  prediction: number;
  confidence: number;
  factors: string[];
}

interface StockLevelsPrediction {
  prediction: number;
  status: 'optimal' | 'low' | 'critical';
  recommendation: string;
}

interface StockoutRiskPrediction {
  probability: number;
  timeline: string;
  preventionActions: string[];
}

interface SalesVolumePrediction {
  prediction: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalFactors: string[];
}

interface ModelAccuracy {
  salesModel: number;
  inventoryModel: number;
  overallAccuracy: number;
}

interface PredictionData {
  salesQuantity: SalesQuantityPrediction;
  stockLevels: StockLevelsPrediction;
  stockoutRisk: StockoutRiskPrediction;
  salesVolume: SalesVolumePrediction;
  accuracy: ModelAccuracy;
}

interface ImageAnalysis {
  products_detected: number;
  shelf_occupancy: number;
  visual_quality_score?: number;
}

interface ForecastPoint {
  date: string;
  predicted: number;
  actual?: number;
  confidence?: number;
}

interface MetricDisplayProps {
  value: number;
  unit?: string;
  confidence?: number;
  status?: string;
  probability?: number;
  timeline?: string;
  trend?: string;
}

interface AnalyticsMetrics {
  salesPrediction: MetricDisplayProps & { confidence: number };
  stockLevels: MetricDisplayProps & { status: string };
  stockoutRisk: MetricDisplayProps & { probability: number; timeline: string };
  salesVolume: MetricDisplayProps & { trend: string };
  accuracy: {
    sales: number;
    inventory: number;
    overall: number;
  };
}

interface MetricsOverviewProps {
  metrics: AnalyticsMetrics | null;
  loading: boolean;
  getStatusColor: (status: string) => string;
  getRiskColor: (probability: number) => string;
  getTrendColor: (trend: string) => string;
}

interface ShelfAnalysisCardProps {
  analyticsData: ImageAnalysis[];
  loading: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface SalesForecastCardProps {
  forecastData: ForecastPoint[];
  forecastAccuracy: number;
  loading: boolean;
}

const MOCK_DATA: PredictionData = {
  salesQuantity: { 
    prediction: 150, 
    confidence: 30, 
    factors: ["Seasonal demand", "Marketing campaigns"] 
  },
  stockLevels: { 
    prediction: 100, 
    status: "optimal", 
    recommendation: "Maintain current levels" 
  },
  stockoutRisk: { 
    probability: 10, 
    timeline: "2-3 weeks", 
    preventionActions: ["Monitor stock levels"] 
  },
  salesVolume: { 
    prediction: 1000, 
    trend: "increasing", 
    seasonalFactors: ["Summer season"] 
  },
  accuracy: { 
    salesModel: 85, 
    inventoryModel: 85, 
    overallAccuracy: 85 
  }
};

export default function AIAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<ImageAnalysis[]>([]);
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [forecastInsights, setForecastInsights] = useState<string[]>([]);
  const [forecastAccuracy, setForecastAccuracy] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);

  const transformMetrics = useCallback((data: PredictionData): AnalyticsMetrics => {
    return {
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
        value: data.stockoutRisk.probability,
        probability: data.stockoutRisk.probability,
        timeline: data.stockoutRisk.timeline,
        unit: '%'
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
  }, []);

  const generateForecastData = useCallback((data: PredictionData): ForecastPoint[] => {
    return [
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
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const transformedMetrics = transformMetrics(MOCK_DATA);
      const forecastPoints = generateForecastData(MOCK_DATA);

      setMetrics(transformedMetrics);
      setForecastData(forecastPoints);
      setForecastInsights([
        "Seasonal uptrend expected in Q3",
        "Marketing campaign impact projected",
        "Inventory optimization recommended"
      ]);
      setForecastAccuracy(85);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [transformMetrics, generateForecastData]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      // Simulate image processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockAnalysis: ImageAnalysis = {
        products_detected: 15,
        shelf_occupancy: 78,
        visual_quality_score: 8.5
      };

      setAnalyticsData(prev => [...prev, mockAnalysis]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image analysis failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Memoized utility functions
  const getStatusColor = useCallback((status: string): string => {
    switch (status.toLowerCase()) {
      case 'optimal': return 'text-green-600';
      case 'low': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, []);

  const getRiskColor = useCallback((probability: number): string => {
    if (probability < 20) return 'text-green-600';
    if (probability < 50) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  const getTrendColor = useCallback((trend: string): string => {
    switch (trend.toLowerCase()) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <MetricsOverview 
        metrics={metrics} 
        loading={loading}
        getStatusColor={getStatusColor}
        getRiskColor={getRiskColor}
        getTrendColor={getTrendColor}
      />

      <ModelAccuracyCard metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShelfAnalysisCard 
          analyticsData={analyticsData} 
          loading={loading}
          onImageUpload={handleImageUpload}
        />
        
        <ForecastInsightsCard insights={forecastInsights} />
      </div>

      <SalesForecastCard 
        forecastData={forecastData} 
        forecastAccuracy={forecastAccuracy}
        loading={loading}
      />
    </div>
  );
}

// Component Functions
function MetricsOverview({ metrics, loading, getStatusColor, getRiskColor, getTrendColor }: MetricsOverviewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!metrics) {
    return <p className="text-sm text-gray-500">No metrics available</p>;
  }

  const metricRows = [
    {
      label: 'Sales Prediction',
      value: metrics.salesPrediction.value,
      unit: metrics.salesPrediction.unit,
      status: 'Forecasted',
      statusClass: 'bg-blue-100 text-blue-800',
      confidence: metrics.salesPrediction.confidence
    },
    {
      label: 'Stock Levels',
      value: metrics.stockLevels.value,
      unit: metrics.stockLevels.unit,
      status: metrics.stockLevels.status,
      statusClass: getStatusColor(metrics.stockLevels.status),
      confidence: undefined
    },
    {
      label: 'Stockout Risk',
      value: metrics.stockoutRisk.value,
      unit: '%',
      status: metrics.stockoutRisk.timeline,
      statusClass: getRiskColor(metrics.stockoutRisk.probability),
      confidence: undefined
    },
    {
      label: 'Sales Volume',
      value: metrics.salesVolume.value,
      unit: metrics.salesVolume.unit,
      status: metrics.salesVolume.trend,
      statusClass: getTrendColor(metrics.salesVolume.trend),
      confidence: undefined
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Key Metrics Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
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
              {metricRows.map((row, index) => (
                <tr key={row.label} className={index % 2 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-300 px-4 py-2 font-medium">{row.label}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {row.value} {row.unit || ''}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-sm capitalize ${row.statusClass}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {row.confidence ? `${row.confidence}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ModelAccuracyCard({ metrics }: { metrics: AnalyticsMetrics | null }) {
  if (!metrics) return null;

  const accuracyData = [
    { label: 'Sales Model', accuracy: metrics.accuracy.sales },
    { label: 'Inventory Model', accuracy: metrics.accuracy.inventory },
    { label: 'Overall Model', accuracy: metrics.accuracy.overall }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Model Accuracy
        </CardTitle>
      </CardHeader>
      <CardContent>
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
              {accuracyData.map(({ label, accuracy }) => (
                <tr key={label}>
                  <td className="border border-gray-300 px-4 py-2 font-medium">{label}</td>
                  <td className="border border-gray-300 px-4 py-2">{accuracy}%</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${accuracy}%` }}
                        />
                      </div>
                      <span className="text-sm text-green-600">Excellent</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ShelfAnalysisCard({ analyticsData, loading, onImageUpload }: ShelfAnalysisCardProps) {
  const latestAnalysis = analyticsData[analyticsData.length - 1];

  const analysisData = latestAnalysis ? [
    { label: 'Products Detected', value: latestAnalysis.products_detected },
    { label: 'Shelf Occupancy', value: `${latestAnalysis.shelf_occupancy}%` },
    ...(latestAnalysis.visual_quality_score ? 
      [{ label: 'Quality Score', value: `${latestAnalysis.visual_quality_score}/10` }] : [])
  ] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Shelf Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild variant="outline" disabled={loading}>
          <label className="cursor-pointer">
            {loading ? 'Analyzing...' : 'Upload Shelf Image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageUpload}
              disabled={loading}
            />
          </label>
        </Button>

        {analysisData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Metric</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {analysisData.map(({ label, value }) => (
                  <tr key={label}>
                    <td className="border border-gray-300 px-3 py-2 font-medium">{label}</td>
                    <td className="border border-gray-300 px-3 py-2">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ForecastInsightsCard({ insights }: { insights: string[] }) {
  if (!insights.length) return <p className="text-sm text-gray-500">No insights available</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Forecast Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Insight</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Priority</th>
              </tr>
            </thead>
            <tbody>
              {insights.map((insight, i) => (
                <tr key={i} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
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
      </CardContent>
    </Card>
  );
}

function SalesForecastCard({ forecastData, forecastAccuracy, loading }: SalesForecastCardProps) {
  if (loading && !forecastData.length) {
    return (
      <div className="h-80 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!forecastData.length) return <p className="text-sm text-gray-500">No forecast data available</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Sales Forecast
          <span className="text-sm text-gray-500">
            (Accuracy: {forecastAccuracy.toFixed(1)}%)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <ForecastDataTable forecastData={forecastData} />
      </CardContent>
    </Card>
  );
}

function ForecastDataTable({ forecastData }: { forecastData: ForecastPoint[] }) {
  return (
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
            <tr key={i} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
              <td className="border border-gray-300 px-4 py-2">{item.date}</td>
              <td className="border border-gray-300 px-4 py-2">{item.predicted}</td>
              <td className="border border-gray-300 px-4 py-2">
                {item.actual ?? '-'}
              </td>
              <td className="border border-gray-300 px-4 py-2">{item.confidence}%</td>
              <td className="border border-gray-300 px-4 py-2">
                {item.actual !== undefined ? (
                  <span className={`${
                    Math.abs(item.predicted - item.actual) / item.actual > 0.1 ?
                    'text-red-600' : 'text-green-600'
                  }`}>
                    {((item.predicted - item.actual) / item.actual * 100).toFixed(1)}%
                  </span>
                ) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}