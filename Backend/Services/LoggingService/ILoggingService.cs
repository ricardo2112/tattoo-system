namespace Backend.Services.LoggingService
{
    public interface ILoggingService
    {
        void LogInformation(string message);
        void LogWarning(string message);
        void LogError(string message, Exception? exception = null);
        void LogDebug(string message);
        void LogCritical(string message, Exception? exception = null);

        // Métodos con contexto adicional
        void LogInformation(string message, object? context);
        void LogWarning(string message, object? context);
        void LogError(string message, Exception? exception, object? context);
    }
}
