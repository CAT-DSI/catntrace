using Microsoft.Data.SqlClient;

public interface IDbConnectionFactory
{
    Task<SqlConnection> CreateConnectionAsync();
}

public class SqlConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public SqlConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DBConnectionString")
                            ?? throw new ArgumentNullException(nameof(configuration), "Connection string cannot be null.");
    }

    public async Task<SqlConnection> CreateConnectionAsync()
    {
        var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return connection;
    }
}
