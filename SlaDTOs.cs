namespace TATA.BACKEND.PROYECTO1.CORE.Core.DTOs
{
    /// <summary>
    /// DTO para rol disponible en filtros
    /// </summary>
    public class RolDisponibleDTO
    {
        public string Rol { get; set; } = string.Empty;
        public int Cantidad { get; set; }
    }

    /// <summary>
    /// DTO para cumplimiento por rol
    /// </summary>
    public class CumplimientoRolDTO
    {
        public string Rol { get; set; } = string.Empty;
        public decimal PorcentajeCumplimiento { get; set; }
        public int TotalTickets { get; set; }
        public int TicketsCumplidos { get; set; }
    }

    /// <summary>
    /// DTO para respuesta del dashboard ejecutivo
    /// </summary>
    public class DashboardEjecutivoDTO
    {
        public decimal SlaGlobalMensual { get; set; }
        public decimal VariacionMesAnterior { get; set; }
        public string MejorRol { get; set; } = string.Empty;
        public List<CumplimientoRolDTO> CumplimientoPorRol { get; set; } = new();
        public List<RolDisponibleDTO> TodosLosRoles { get; set; } = new();
    }
}
