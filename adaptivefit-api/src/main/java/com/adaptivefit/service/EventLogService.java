package com.adaptivefit.service;

import com.adaptivefit.model.EventLog;
import com.adaptivefit.repository.EventLogRepository;
import org.springframework.stereotype.Service;

@Service
public class EventLogService {

    private final EventLogRepository eventLogRepository;

    public EventLogService(EventLogRepository eventLogRepository) {
        this.eventLogRepository = eventLogRepository;
    }

    public void logEvent(Long userId, String eventType, String eventDataJson) {
        EventLog eventLog = new EventLog();
        eventLog.setUserId(userId);
        eventLog.setEventType(eventType);
        eventLog.setEventData(eventDataJson);
        eventLogRepository.save(eventLog);
    }
}
