import { BaseTask } from './base-task';
import { TaskInput, TaskResult, TaskContext } from '../types';

export class BookFlightTask extends BaseTask {
  readonly type = 'book_flight';
  readonly description = 'Book a flight from origin to destination';

  validate(input: TaskInput): boolean {
    return !!(input.from && input.to && input.date && input.passenger);
  }

  async execute(input: TaskInput, context: TaskContext): Promise<TaskResult> {
    try {
      this.log(`✈️ Booking flight: ${input.from} → ${input.to}`);

      // Step 1: Search flights
      this.log('🔍 Searching available flights...');
      const searchResult = await this.callTool(
        context.backendUrl,
        context.agentId,
        'search_flights',
        { from: input.from, to: input.to, date: input.date },
        context.callerWallet,
        '1000000' // 0.1 XLM
      );

      if (!searchResult.flights || searchResult.flights.length === 0) {
        return { success: false, error: 'No flights found' };
      }

      // Step 2: Book best flight
      const bestFlight = searchResult.flights[0];
      this.log(`🎫 Booking flight: ${bestFlight.airline} ${bestFlight.route}`);
      
      const bookingResult = await this.callTool(
        context.backendUrl,
        context.agentId,
        'book_flight',
        { 
          flight_id: bestFlight.id, 
          ...input.passenger 
        },
        context.callerWallet,
        '5000000' // 0.5 XLM
      );

      this.log(`✅ Flight booked! PNR: ${bookingResult.pnr}`);
      return { 
        success: true, 
        data: { 
          pnr: bookingResult.pnr, 
          flight: bestFlight 
        } 
      };

    } catch (error: any) {
      this.log(`❌ Booking failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}