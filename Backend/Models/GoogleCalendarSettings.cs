namespace Backend.Models
{
    public class GoogleCalendarSettings
    {
        public string ApplicationName { get; set; } = "Tattoo System";
        public string CalendarId { get; set; } = "primary";
        public string CredentialsPath { get; set; } = "credentials.json";
        public string TokenPath { get; set; } = "token.json";
        public string ServiceAccountKeyPath { get; set; } = "service-account-key.json";
        public bool UseServiceAccount { get; set; } = false;
        public bool Enabled { get; set; } = true;
    }
}
