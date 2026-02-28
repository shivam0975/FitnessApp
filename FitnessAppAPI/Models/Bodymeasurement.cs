using System;
using System.Collections.Generic;

namespace FitnessAppAPI.Models;

public partial class Bodymeasurement
{
    public Guid MeasurementId { get; set; }

    public Guid UserId { get; set; }

    public DateTime MeasuredAt { get; set; }

    public decimal? WeightKg { get; set; }

    public decimal? BodyFatPercent { get; set; }

    public decimal? WaistCm { get; set; }

    public decimal? HipsCm { get; set; }

    public decimal? BicepCm { get; set; }

    public decimal? ChestCm { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
