'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Image, TrendingUp, Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';
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
import { SalesForecast, AIAnalyticsResult } from '@/types'; // Import the correct types

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

export default function AIAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AIAnalyticsData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[] | null>(null);
  const [forecastInsights, setForecastInsights] = useState<string[]>([]);
  const [forecastAccuracy, setForecastAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const [analyticsRes, forecastRes] = await Promise.all([
        apiService.aiAnalytics.getComprehensiveAnalytics(),
        apiService.aiAnalytics.analyzeSalesQuantity(),
      ]);

      if (analyticsRes.success && analyticsRes.data) {
        // Transform AIAnalyticsResult to AIAnalyticsData
        const transformedAnalyticsData: AIAnalyticsData = {
          insights: analyticsRes.data.insights,
          imageAnalyses: analyticsRes.data.imageAnalyses.map(analysis => ({
            products_detected: analysis.result.detectedProducts?.length || 0,
            shelf_occupancy: analysis.result.shelfOccupancy,
            visual_quality_score: analysis.result.visualQualityScore
          })),
          predictions: analyticsRes.data.predictions
        };
        
        setAnalyticsData(transformedAnalyticsData);
      } else {
        throw new Error(analyticsRes.error || 'Failed to load analytics data');
      }

      if (forecastRes.success && forecastRes.data) {
        // Transform SalesForecast to ForecastData[]
        const transformedForecastData = forecastRes.data.forecast.map(item => ({
          date: item.date,
          predicted: item.predictedSales,
          confidence: item.confidence
        }));
        
        setForecastData(transformedForecastData);
        setForecastInsights(forecastRes.data.insights);
        setForecastAccuracy(forecastRes.data.accuracy);
      } else {
        throw new Error(forecastRes.error || 'Failed to load forecast data');
      }
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
      const response = await apiService.aiAnalytics.analyzeShelfImage(file);

      if (response.success && response.data) {
        // Transform the image analysis response to match our interface
        const transformedImageAnalysis = {
          products_detected: response.data.result?.detectedProducts?.length || 0,
          shelf_occupancy: response.data.result?.shelfOccupancy || 0,
          visual_quality_score: response.data.result?.visualQualityScore
        };
        
        setAnalyticsData(prev => ({
          ...(prev || { insights: [], imageAnalyses: [] }),
          imageAnalyses: [...(prev?.imageAnalyses || []), transformedImageAnalysis]
        }));
      } else {
        throw new Error(response.error || 'Image analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
      console.error('Image upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Brain className="h-5 w-5" />}
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !analyticsData ? (
              <div className="text-center py-4">Loading insights...</div>
            ) : analyticsData?.insights?.length ? (
              <ul className="space-y-2">
                {analyticsData.insights.map((insight, i) => (
                  <li key={i} className="text-sm">
                    • {insight}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No insights available</p>
            )}
          </CardContent>
        </Card>

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
                  {loading ? 'Uploading...' : 'Upload Shelf Image'}
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
                <div className="space-y-2">
                  <p className="text-sm">
                    Products Detected: {analyticsData.imageAnalyses[0].products_detected}
                  </p>
                  <p className="text-sm">
                    Shelf Occupancy: {analyticsData.imageAnalyses[0].shelf_occupancy}%
                  </p>
                  {analyticsData.imageAnalyses[0].visual_quality_score && (
                    <p className="text-sm">
                      Quality Score: {analyticsData.imageAnalyses[0].visual_quality_score}/10
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Forecast
            {forecastAccuracy && (
              <span className="text-sm text-muted-foreground">
                (Accuracy: {(forecastAccuracy * 100).toFixed(1)}%)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !forecastData ? (
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : forecastData ? (
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
              
              {forecastInsights.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Forecast Insights:</h4>
                  <ul className="space-y-1">
                    {forecastInsights.map((insight, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No forecast data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}