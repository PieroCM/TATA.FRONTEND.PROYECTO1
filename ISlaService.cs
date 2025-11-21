using TATA.BACKEND.PROYECTO1.CORE.Core.DTOs;

namespace TATA.BACKEND.PROYECTO1.CORE.Core.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de SLA
    /// </summary>
    public interface ISlaService
    {
        /// <summary>
        /// Obtiene los años disponibles en la base de datos
        /// </summary>
        Task<List<int>> GetAniosDisponibles();

        /// <summary>
        /// Obtiene los roles disponibles para un año y mes específicos
        /// </summary>
        Task<List<RolDisponibleDTO>> GetRolesDisponibles(int anio, int mes);

        /// <summary>
        /// Obtiene los datos del dashboard ejecutivo de SLA
        /// </summary>
        Task<DashboardEjecutivoDTO> GetDashboardEjecutivo(int anio, int mes, List<string>? roles = null);
    }
}
