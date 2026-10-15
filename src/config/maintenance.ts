export interface MaintenanceConfig {
  enabled: boolean;
  badge: string;
  title: string;
  message: string;
  details?: string;
  allowAdminBypass: boolean;
}

export const MAINTENANCE_CONFIG: MaintenanceConfig = {
  enabled: true,
  badge: 'MODO MANTENIMIENTO',
  title: 'Tienda en Mantenimiento Temporal',
  message: 'Estamos realizando mejoras y optimizaciones en la plataforma. Las compras, recargas y transacciones están pausadas temporalmente.',
  details: 'Tus pedidos registrados y saldo en billetera están 100% protegidos. Volveremos a habilitar el servicio en cuanto concluya la actualización.',
  allowAdminBypass: true,
};
