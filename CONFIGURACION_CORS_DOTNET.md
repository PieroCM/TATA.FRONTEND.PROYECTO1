# 🔧 Configuración CORS para .NET API

## ⚠️ Problema Actual
Tu API está en: `http://localhost:5260`
Tu Frontend está en: `http://localhost:9000`

Sin CORS configurado, el navegador **bloqueará** las peticiones por seguridad.

## ✅ Solución: Agregar CORS en Program.cs

### **Paso 1: Abre tu archivo `Program.cs` en Visual Studio 2022**

### **Paso 2: Agrega este código ANTES de `var app = builder.Build();`**

```csharp
// ====== AGREGAR ANTES DE var app = builder.Build(); ======
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowQuasarApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:9000",
            "http://25.55.137.217:9000",
            "http://192.168.100.4:9000",
            "http://172.30.192.1:9000"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

### **Paso 3: Agrega este código DESPUÉS de `var app = builder.Build();`**

```csharp
// ====== AGREGAR DESPUÉS DE var app = builder.Build(); ======
// Debe ir ANTES de app.UseAuthorization();
app.UseCors("AllowQuasarApp");
```

## 📋 Ejemplo Completo de Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowQuasarApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:9000",
            "http://25.55.137.217:9000",
            "http://192.168.100.4:9000",
            "http://172.30.192.1:9000"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ✅ Use CORS (ANTES de UseAuthorization)
app.UseCors("AllowQuasarApp");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

## 🎯 Próximos Pasos

1. ✅ **Actualizar `.env`** → Ya está hecho: `http://localhost:5260/api`
2. ⏳ **Agregar CORS en `Program.cs`** → Sigue los pasos de arriba
3. ⏳ **Reiniciar API** → Detén (Shift+F5) y vuelve a iniciar (F5) en Visual Studio
4. ⏳ **Refrescar navegador** → Presiona F5 en tu navegador
5. ⏳ **Crear controladores SLA** → Usa los ejemplos de `API_DOTNET_MODELS.md`

## 🚨 Verificación

Después de configurar CORS, prueba en el navegador:
- Abre: `http://localhost:9000`
- Abre Console (F12)
- **NO** deberías ver errores de CORS ni `ERR_CONNECTION_REFUSED`

Si ves **404 Not Found**, es porque aún no has creado los controladores (usa `API_DOTNET_MODELS.md`).
