import { FaceData } from '../components/CameraView';
import { Metrics } from '../models/Metrics';
import { MetricsCalculator } from '../utils/metricsCalculator';
import { MetricsStorage } from './storageService';

export class FatigueDetectorService {
  private metricsCalculator: MetricsCalculator;
  private sessionId: string | null = null;
  private isActive = false;
  private metricsBuffer: Metrics[] = [];
  private readonly BUFFER_SIZE = 5; // Buffer 5 metrics before batch insert

  constructor() {
    this.metricsCalculator = new MetricsCalculator();
  }

  /**
   * Start fatigue detection for a session
   */
  public start(sessionId: string): void {
    this.sessionId = sessionId;
    this.isActive = true;
    this.metricsCalculator.reset();
    this.metricsBuffer = [];
    console.log('Fatigue detector started for session:', sessionId);
  }

  /**
   * Stop fatigue detection
   */
  public async stop(): Promise<void> {
    this.isActive = false;

    // Flush remaining buffer
    if (this.metricsBuffer.length > 0) {
      await this.flushMetrics();
    }

    this.sessionId = null;
    console.log('Fatigue detector stopped');
  }

  /**
   * Process new face data from camera
   */
  public async processFaceData(faceData: FaceData): Promise<Metrics | null> {
    if (!this.isActive || !this.sessionId) {
      return null;
    }

    // Calculate metrics
    const metrics = this.metricsCalculator.processFaceData(faceData, this.sessionId);

    // Add to buffer
    this.metricsBuffer.push(metrics);

    // Flush buffer when full
    if (this.metricsBuffer.length >= this.BUFFER_SIZE) {
      await this.flushMetrics();
    }

    return metrics;
  }

  /**
   * Flush metrics buffer to database
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    try {
      await MetricsStorage.insertBatch([...this.metricsBuffer]);
      this.metricsBuffer = [];
    } catch (error) {
      console.error('Failed to flush metrics:', error);
    }
  }

  /**
   * Get current fatigue score
   */
  public getCurrentFatigueScore(): number {
    const recentMetrics = this.metricsCalculator.getRecentMetrics();
    if (recentMetrics.length === 0) return 0;

    // Use average of last 5 data points for smoother score
    const lastFive = recentMetrics.slice(-5);
    const avgEyeOpenness = lastFive.reduce((sum, d) => sum + d.value, 0) / lastFive.length;

    // Simple fatigue score based on eye openness
    return Math.max(0, (1.0 - avgEyeOpenness) * 100);
  }

  /**
   * Get baseline blink rate (null until calculated)
   */
  public getBaselineBlinkRate(): number | null {
    return this.metricsCalculator.getBaselineBlinkRate();
  }

  /**
   * Check if detector is active
   */
  public isRunning(): boolean {
    return this.isActive;
  }
}

// Singleton instance
export const fatigueDetector = new FatigueDetectorService();
