# live_monitor.py
import asyncio
from aiokafka import AIOKafkaConsumer
import json

async def main():
    consumer = AIOKafkaConsumer(
        "appointment_events", "prediction_events", # Subscribes to BOTH topics!
        bootstrap_servers="localhost:9092",
        group_id="live-dashboard-group-1", 
        auto_offset_reset="latest" 
    )
    
    print("Starting Live Monitor...")
    await consumer.start()
    print("Listening for events on 'appointment_events' and 'prediction_events'...")
    
    try:
        async for msg in consumer:
            print("\n" + "="*20 + " NEW EVENT " + "="*20)
            print(f"Topic: {msg.topic}") # See which service sent it
            
            try:
                data = json.loads(msg.value.decode('utf-8'))
                print(json.dumps(data, indent=2))
            except Exception as e:
                print(f"Raw data: {msg.value}")
                
    finally:
        await consumer.stop()
        print("Live Monitor stopped.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Shutting down...")