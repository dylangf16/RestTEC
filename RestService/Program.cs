using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json; // Add this import statement

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.UseHttpsRedirection();

// Map a route to handle login requests from JavaScript
app.MapPost(
    "/login",
    async context =>
    {
        // Read request body
        using var reader = new StreamReader(context.Request.Body);
        var body = await reader.ReadToEndAsync();

        // Deserialize JSON request body to obtain username and password
        var loginInfo = System.Text.Json.JsonSerializer.Deserialize<LoginInfo>(body);

        // Access the JSON file to authenticate the user
        var usuariosJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "usuarios.json");
        Console.WriteLine($"Usuarios JSON Path: {usuariosJsonPath}"); // Debugging output

        var usuariosJson = await File.ReadAllTextAsync(usuariosJsonPath);
        var usuariosObject = System.Text.Json.JsonSerializer.Deserialize<
            Dictionary<string, List<Usuario>>
        >(usuariosJson);

        // Check if the username and password match
        if (usuariosObject != null && usuariosObject.ContainsKey("usuarios"))
        {
            var usuarios = usuariosObject["usuarios"];
            var user = usuarios?.FirstOrDefault(u =>
                u.correo == loginInfo?.correo && u.contrasena == loginInfo?.contrasena
            );

            if (user != null)
            {
                context.Response.StatusCode = StatusCodes.Status200OK; // Set status code before writing to response
                var client_id = user.id; // Get the client ID
                var responseData = new
                {
                    message = "Inicio de sesión exitoso",
                    client_id = client_id
                };
                var jsonResponse = System.Text.Json.JsonSerializer.Serialize(responseData);
                await context.Response.WriteAsync(jsonResponse);
            }
            else
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized; // Set status code before writing to response
                await context.Response.WriteAsync("Invalid username or password");
            }
        }
        else
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError; // Set status code before writing to response
            await context.Response.WriteAsync("Invalid JSON file format");
        }
    }
);

// Map a route to handle registration requests
app.MapPost(
    "/register",
    async context =>
    {
        // Read request body
        using var reader = new StreamReader(context.Request.Body);
        var body = await reader.ReadToEndAsync();

        // Deserialize JSON request body to obtain registration data
        var registrationData = System.Text.Json.JsonSerializer.Deserialize<RegistrationData>(body);

        // Access the JSON file to check for existing users
        var usuariosJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "usuarios.json");
        Console.WriteLine($"Usuarios JSON Path: {usuariosJsonPath}"); // Debugging output

        // Read existing users from the JSON file
        Dictionary<string, List<Usuario>> usuariosObject;
        try
        {
            var usuariosJson = await File.ReadAllTextAsync(usuariosJsonPath);
            usuariosObject = System.Text.Json.JsonSerializer.Deserialize<
                Dictionary<string, List<Usuario>>
            >(usuariosJson);
        }
        catch (Exception ex)
        {
            // Handle file read exception
            Console.WriteLine($"Error reading usuarios.json file: {ex.Message}");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync("Error reading usuarios.json file");
            return;
        }

        // Check if the usuariosObject is null, if yes, initialize it
        if (usuariosObject == null)
        {
            usuariosObject = new Dictionary<string, List<Usuario>>();
            usuariosObject.Add("usuarios", new List<Usuario>());
        }

        // Check if the email already exists
        var existingUser = usuariosObject["usuarios"]
            ?.FirstOrDefault(u => u.correo == registrationData?.correo);
        if (existingUser != null)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsync("El correo electrónico ya está registrado");
            return;
        }

        // Generate a unique ID for the new user
        int newId =
            usuariosObject["usuarios"].Count > 0
                ? usuariosObject["usuarios"].Max(u => u.id) + 1
                : 1;

        // Create new user object
        var newUser = new Usuario(
            newId,
            registrationData.nombre,
            registrationData.apellido1,
            registrationData.apellido2,
            registrationData.correo,
            registrationData.contrasena,
            registrationData.cedula,
            registrationData.fecha_nacimiento,
            registrationData.telefonos ?? new List<string>(),
            registrationData.direccion ?? new Direccion(),
            "cliente", // You can set the default role here
            0
        );

        // Add the new user to the list of users
        usuariosObject["usuarios"].Add(newUser);

        // Write updated data back to JSON file with indented formatting
        try
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            var updatedJson = System.Text.Json.JsonSerializer.Serialize(usuariosObject, options);
            await File.WriteAllTextAsync(usuariosJsonPath, updatedJson);
        }
        catch (Exception ex)
        {
            // Handle file write exception
            Console.WriteLine($"Error writing to usuarios.json file: {ex.Message}");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync("Error writing to usuarios.json file");
            return;
        }

        // Return success message
        context.Response.StatusCode = StatusCodes.Status201Created;
        await context.Response.WriteAsync("Registro exitoso");
    }
);

// Map a route to handle getting dishes
app.MapGet(
    "/dishes",
    async context =>
    {
        // Access the JSON file to get the list of dishes
        var dishesJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "menu.json");
        var platosJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "platos.json");
        Console.WriteLine($"Menu JSON Path: {dishesJsonPath}"); // Debugging output
        Console.WriteLine($"Platos JSON Path: {platosJsonPath}"); // Debugging output

        try
        {
            var dishesJson = await File.ReadAllTextAsync(dishesJsonPath);
            var platosJson = await File.ReadAllTextAsync(platosJsonPath);
            var menuObject = System.Text.Json.JsonSerializer.Deserialize<Menu>(dishesJson);
            var platosObject = System.Text.Json.JsonSerializer.Deserialize<Platos>(platosJson);

            // Return the list of dishes and platos
            context.Response.StatusCode = StatusCodes.Status200OK;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(
                new { dishes = menuObject.menu, platos = platosObject.platos }
            );
        }
        catch (Exception ex)
        {
            // Handle file read exception
            Console.WriteLine($"Error reading json files: {ex.Message}");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync("Error reading json files");
        }
    }
);

// Map a route to handle placing an order
app.MapPost(
    "/order",
    async context =>
    {
        try
        {
            // Read the request body
            var requestBody = await new StreamReader(context.Request.Body).ReadToEndAsync();

            // Deserialize the request body to an Order object
            var order = System.Text.Json.JsonSerializer.Deserialize<Order>(requestBody);
            order.id_chef = 0;

            // Set the time when the order was taken
            DateTime utcNow = DateTime.UtcNow;
            TimeZoneInfo cstZone = TimeZoneInfo.FindSystemTimeZoneById("Central Standard Time");
            DateTime cstTime = TimeZoneInfo.ConvertTimeFromUtc(utcNow, cstZone);
            order.OrderTakenAt = cstTime.AddHours(-1);

            // Generate a random id_orden
            var random = new Random();
            order.id_orden = random.Next(1, 1000000); // Generates a random integer between 1 and 1000000

            // Read existing plates from platos.json
            var json = await System.IO.File.ReadAllTextAsync("db\\platos.json");
            var platosData = System.Text.Json.JsonSerializer.Deserialize<
                Dictionary<string, List<Plato>>
            >(json);
            var platos = platosData["platos"];

            // Add the tiempoEstimado to each plate in the order
            foreach (var plate in order.platos)
            {
                var plato = platos.Find(p => p.id_plato == plate.id_plato);
                if (plato != null)
                {
                    plate.tiempoEstimado = plato.tiempoEstimado;
                }
            }

            foreach (var plate in order.platos)
            {
                var plato = platos.Find(p => p.id_plato == plate.id_plato);
                if (plato != null)
                {
                    plate.tiempoEstimado = plato.tiempoEstimado;
                    plato.vendidos += plate.cantidad; // increment vendidos by the cantidad of each plate
                }
            }
            // Write the updated plates back to platos.json
            platosData["platos"] = platos;
            var platosJson = System.Text.Json.JsonSerializer.Serialize(
                platosData,
                new JsonSerializerOptions { WriteIndented = true }
            );
            await System.IO.File.WriteAllTextAsync("db\\platos.json", platosJson);

            // Read existing orders from pedidos.json
            json = await System.IO.File.ReadAllTextAsync("db\\pedidos.json");
            var pedidos = System.Text.Json.JsonSerializer.Deserialize<
                Dictionary<string, List<Order>>
            >(json);

            // Add the new order to the list
            pedidos["pedidos"].Add(order);

            // Write the updated list back to pedidos.json
            json = System.Text.Json.JsonSerializer.Serialize(
                pedidos,
                new JsonSerializerOptions { WriteIndented = true }
            );
            await System.IO.File.WriteAllTextAsync("db\\pedidos.json", json);

            // Read existing users from usuarios.json
            json = await System.IO.File.ReadAllTextAsync("db\\usuarios.json");
            var usuariosData = System.Text.Json.JsonSerializer.Deserialize<
                Dictionary<string, List<Usuario>>
            >(json);
            var usuarios = usuariosData["usuarios"];

            // Find the user with the matching id_cliente
            var usuarioIndex = usuarios.FindIndex(u => u.id == order.id_cliente);
            if (usuarioIndex != -1)
            {
                var usuario = usuarios[usuarioIndex];

                // Create a new Usuario object with the incremented NumPedidos
                var updatedUsuario = usuario with
                {
                    NumPedidos = usuario.NumPedidos + 1
                };

                // Replace the existing user in the list with the new one
                usuarios[usuarioIndex] = updatedUsuario;
            }

            // Write the updated users back to usuarios.json
            usuariosData["usuarios"] = usuarios;
            json = System.Text.Json.JsonSerializer.Serialize(
                usuariosData,
                new JsonSerializerOptions { WriteIndented = true }
            );
            await System.IO.File.WriteAllTextAsync("db\\usuarios.json", json);
            // Return a success response
            context.Response.ContentType = "application/json";
            var response = new { message = "Orden Registrada", order_id = order.id_orden };
            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
        }
        catch (Exception ex)
        {
            // Handle exceptions
            Console.WriteLine($"Error processing order: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync("Error processing order");
        }
    }
);

//Map route to handle getting order with orderID
app.MapGet(
    "/order/{orderId}",
    async (HttpContext context, int orderId) =>
    {
        try
        {
            // Read existing orders from pedidos.json
            var json = await System.IO.File.ReadAllTextAsync("db\\pedidos.json");
            var pedidos = System.Text.Json.JsonSerializer.Deserialize<
                Dictionary<string, List<Order>>
            >(json);

            // Find the order with the matching id_orden
            var order = pedidos["pedidos"].Find(o => o.id_orden == orderId);

            if (order != null)
            {
                // Return the order
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(order));
            }
            else
            {
                // Return a 404 Not Found response if the order was not found
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                await context.Response.WriteAsync("Order not found");
            }
        }
        catch (Exception ex)
        {
            // Handle exceptions
            Console.WriteLine($"Error retrieving order: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync("Error retrieving order");
        }
    }
);

//Map route to handle getting order with clientID
app.MapGet(
    "/orders/{clientId}",
    async (HttpContext context, int clientId) =>
    {
        try
        {
            // Read existing orders from pedidos.json
            var json = await System.IO.File.ReadAllTextAsync("db\\pedidos.json");
            var pedidos = System.Text.Json.JsonSerializer.Deserialize<
                Dictionary<string, List<Order>>
            >(json);

            // Find all orders with the matching id_cliente
            var clientOrders = pedidos["pedidos"].Where(o => o.id_cliente == clientId).ToList();

            if (clientOrders.Any())
            {
                // Return the orders
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(
                    System.Text.Json.JsonSerializer.Serialize(clientOrders)
                );
                Console.WriteLine(clientOrders);
            }
            else
            {
                // Return a 404 Not Found response if no orders were found for the client
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                await context.Response.WriteAsync("No orders found for this client");
            }
        }
        catch (Exception ex)
        {
            // Handle exceptions
            Console.WriteLine($"Error retrieving orders: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync("Error retrieving orders");
        }
    }
);

// Map a route to retrieve the menu
app.MapGet(
    "/menu",
    async context =>
    {
        // Access the JSON file to get the list of dishes
        var dishesJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "menu.json");
        Console.WriteLine($"Dishes JSON Path: {dishesJsonPath}"); // Debugging output

        try
        {
            var dishesJson = await File.ReadAllTextAsync(dishesJsonPath);
            var menuObject = System.Text.Json.JsonSerializer.Deserialize<Menu>(dishesJson);

            // Return the list of dishes
            context.Response.StatusCode = StatusCodes.Status200OK;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { dishes = menuObject.menu });
        }
        catch (Exception ex)
        {
            // Handle file read exception
            Console.WriteLine($"Error reading menu.json file: {ex.Message}");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync("Error reading menu.json file");
        }
    }
);

// Map a route to handle updating user accounts
app.MapPut(
    "/update/{userId}",
    async (HttpContext context) =>
    {
        // Extract userId from route parameters
        if (
            !context.Request.RouteValues.TryGetValue("userId", out var userIdObj)
            || !int.TryParse(userIdObj?.ToString(), out var userId)
        )
        {
            // userId not found or not a valid integer
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsync("Invalid user ID");
            return;
        }

        // Read request body
        using var reader = new StreamReader(context.Request.Body);
        var body = await reader.ReadToEndAsync();

        // Deserialize JSON request body to obtain updated user data
        var updateData = System.Text.Json.JsonSerializer.Deserialize<UpdateData>(body);

        // Access the JSON file to update the user account
        var usuariosJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "usuarios.json");
        Console.WriteLine($"Usuarios JSON Path: {usuariosJsonPath}"); // Debugging output

        try
        {
            var usuariosJson = await File.ReadAllTextAsync(usuariosJsonPath);
            var usuariosObject = System.Text.Json.JsonSerializer.Deserialize<
                Dictionary<string, List<Usuario>>
            >(usuariosJson);

            // Find the user with the specified ID
            var userIndex = usuariosObject?["usuarios"]?.FindIndex(u => u.id == userId);

            if (userIndex != null && userIndex >= 0)
            {
                // Update user data
                usuariosObject["usuarios"][userIndex.Value] = new Usuario(
                    userId,
                    updateData.nombre ?? usuariosObject["usuarios"][userIndex.Value].nombre,
                    updateData.apellido1 ?? usuariosObject["usuarios"][userIndex.Value].apellido1,
                    updateData.apellido2 ?? usuariosObject["usuarios"][userIndex.Value].apellido2,
                    updateData.correo ?? usuariosObject["usuarios"][userIndex.Value].correo,
                    updateData.contrasena ?? usuariosObject["usuarios"][userIndex.Value].contrasena,
                    updateData.cedula ?? usuariosObject["usuarios"][userIndex.Value].cedula,
                    updateData.fecha_nacimiento
                        ?? usuariosObject["usuarios"][userIndex.Value].fecha_nacimiento,
                    updateData.telefonos ?? usuariosObject["usuarios"][userIndex.Value].telefonos,
                    updateData.direccion ?? usuariosObject["usuarios"][userIndex.Value].direccion,
                    usuariosObject["usuarios"][userIndex.Value].Rol, // Keeping the same role
                    usuariosObject["usuarios"][userIndex.Value].NumPedidos // Keeping the same role
                );

                // Write updated data back to JSON file
                var updatedJson = System.Text.Json.JsonSerializer.Serialize(usuariosObject);
                await File.WriteAllTextAsync(usuariosJsonPath, updatedJson);

                // Return success message
                context.Response.StatusCode = StatusCodes.Status200OK;
                await context.Response.WriteAsync("User account updated successfully");
            }
            else
            {
                // No user found with the specified ID
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                await context.Response.WriteAsync($"User with ID {userId} not found");
            }
        }
        catch (Exception ex)
        {
            // Handle file read/write exceptions
            Console.WriteLine($"Error updating user account: {ex.Message}");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync("Error updating user account");
        }
    }
);

// Map a route to handle deleting user accounts
app.MapDelete(
    "/delete/{userId}",
    async (HttpContext context) =>
    {
        // Extract userId from route parameters
        if (
            !context.Request.RouteValues.TryGetValue("userId", out var userIdObj)
            || !int.TryParse(userIdObj?.ToString(), out var userId)
        )
        {
            // userId not found or not a valid integer
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsync("Invalid user ID");
            return;
        }

        // Access the JSON file to get the list of users
        var usuariosJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "db", "usuarios.json");
        Console.WriteLine($"Usuarios JSON Path: {usuariosJsonPath}"); // Debugging output

        try
        {
            var usuariosJson = await File.ReadAllTextAsync(usuariosJsonPath);
            var usuariosObject = System.Text.Json.JsonSerializer.Deserialize<
                Dictionary<string, List<Usuario>>
            >(usuariosJson);

            // Find the index of the user with the specified ID
            var userIndex = usuariosObject?["usuarios"]?.FindIndex(u => u.id == userId);

            if (userIndex != null && userIndex >= 0)
            {
                // Remove the user from the list
                usuariosObject["usuarios"].RemoveAt(userIndex.Value);

                // Write updated data back to JSON file
                var updatedJson = System.Text.Json.JsonSerializer.Serialize(usuariosObject);
                await File.WriteAllTextAsync(usuariosJsonPath, updatedJson);

                // Return success message
                context.Response.StatusCode = StatusCodes.Status200OK;
                await context.Response.WriteAsync("User account deleted successfully");
            }
            else
            {
                // No user found with the specified ID
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                await context.Response.WriteAsync($"User with ID {userId} not found");
            }
        }
        catch (Exception ex)
        {
            // Handle file read/write exceptions
            Console.WriteLine($"Error deleting user account: {ex.Message}");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync("Error deleting user account");
        }
    }
);

app.MapPost(
    "/feedback",
    async (HttpContext context) =>
    {
        try
        {
            // Read the request body
            var requestBody = await new StreamReader(context.Request.Body).ReadToEndAsync();
            var feedback = System.Text.Json.JsonSerializer.Deserialize<Feedback>(requestBody);

            // Read existing platos from platos.json
            var json = await System.IO.File.ReadAllTextAsync("db\\platos.json");
            var platos = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, List<Plato>>>(json);

            // Find the plato for the given id_plato
            var plato = platos["platos"].FirstOrDefault(p => p.id_plato == feedback.id_plato);

            if (plato != null)
            {
                // Update the feedback
                plato.feedback = (plato.feedback + feedback.rating) / 2;
            }

            // Write the updated platos back to platos.json
            await System.IO.File.WriteAllTextAsync(
                "db\\platos.json",
                System.Text.Json.JsonSerializer.Serialize(platos)
            );

            // Return a 200 OK response
            context.Response.StatusCode = StatusCodes.Status200OK;
            await context.Response.WriteAsync("Feedback received");
        }
        catch (Exception ex)
        {
            // Handle exceptions
            Console.WriteLine($"Error receiving feedback: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync("Error receiving feedback");
        }
    }
);


app.Run();

// Models login
record LoginInfo(string correo, string contrasena);

record Usuario(
    int id,
    string nombre,
    string apellido1,
    string apellido2,
    string correo,
    string contrasena,
    string cedula,
    string fecha_nacimiento,
    List<string> telefonos,
    Direccion direccion,
    string Rol,
    int NumPedidos
);

// Models Registration
record RegistrationData(
    string nombre,
    string apellido1,
    string apellido2,
    string correo,
    string contrasena,
    string cedula,
    string fecha_nacimiento,
    List<string> telefonos,
    Direccion direccion
);

public record Direccion(string? provincia = null, string? canton = null, string? distrito = null);

//Models Dishes
public record MenuDish(
    int id_plato,
    string? nombre_plato,
    int precio_colones,
    int calorias,
    string? tipo
);

public record Menu(List<MenuDish> menu);

public record Dish(
    int id_plato,
    string? nombre,
    string? descripcion,
    int vendidos,
    double feedback,
    int tiempoEstimado
);

public record Platos(List<Dish> platos);

//Models Order
public class Order
{
    public int id_orden { get; set; }
    public int id_cliente { get; set; }
    public List<Plate> platos { get; set; }
    public int total { get; set; }
    public int id_chef { get; set; }

    public DateTime OrderTakenAt { get; set; }
}

public class Plato
{
    public int id_plato { get; set; }
    public string nombre { get; set; }
    public string descripcion { get; set; }
    public int vendidos { get; set; }
    public double feedback { get; set; }
    public int tiempoEstimado { get; set; }
}

public class Plate
{
    public int id_plato { get; set; }
    public string nombre_plato { get; set; }
    public int precio { get; set; }
    public int cantidad { get; set; }
    public int tiempoEstimado { get; set; }
}

public record OrderData(
    int id_pedido,
    int id_cliente,
    List<MenuDish> platos,
    DateTime fecha_hora,
    string estado,
    double montoTotal,
    double tiempoEstimado
);

public record Pedidos(List<OrderData> PedidosList);

//Model Update
public record UpdateData(
    string nombre,
    string apellido1,
    string apellido2,
    string correo,
    string contrasena,
    string cedula,
    string fecha_nacimiento,
    List<string> telefonos,
    Direccion direccion
);

record Usuarios(List<Usuario> UsuariosList);

public class Feedback
{
    public int id_plato { get; set; }
    public double rating { get; set; } // Assuming the rating is a double
}

public class Rating
{
    public int id_plato { get; set; }
    public double rating { get; set; } // Assuming the rating is a double
}