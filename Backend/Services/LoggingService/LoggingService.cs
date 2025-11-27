using Serilog;

namespace Backend.Services.LoggingService
{
    public class LoggingService : ILoggingService
    {
        private readonly ILogger<LoggingService> _logger;

        public LoggingService(ILogger<LoggingService> logger)
        {
            _logger = logger;
        }

        public void LogInformation(string message)
        {
            _logger.LogInformation(message);
        }

        public void LogInformation(string message, object? context)
        {
            _logger.LogInformation("{Message} | Context: {@Context}", message, context);
        }

        public void LogWarning(string message)
        {
            _logger.LogWarning(message);
        }

        public void LogWarning(string message, object? context)
        {
            _logger.LogWarning("{Message} | Context: {@Context}", message, context);
        }

        public void LogError(string message, Exception? exception = null)
        {
            if (exception != null)
            {
                _logger.LogError(exception, message);
            }
            else
            {
                _logger.LogError(message);
            }
        }

        public void LogError(string message, Exception? exception, object? context)
        {
            if (exception != null)
            {
                _logger.LogError(exception, "{Message} | Context: {@Context}", message, context);
            }
            else
            {
                _logger.LogError("{Message} | Context: {@Context}", message, context);
            }
        }

        public void LogDebug(string message)
        {
            _logger.LogDebug(message);
        }

        public void LogCritical(string message, Exception? exception = null)
        {
            if (exception != null)
            {
                _logger.LogCritical(exception, message);
            }
            else
            {
                _logger.LogCritical(message);
            }
        }
    }
}
