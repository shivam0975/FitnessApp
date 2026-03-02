using System;
using System.Collections.Generic;

namespace FitnessAppAPI.Models;

public partial class VwUserdashboard
{
    public Guid? UserId { get; set; }

    public string? Username { get; set; }

    public string? FullName { get; set; }

    public decimal? CurrentWeightKg { get; set; }

    public decimal? TargetWeightKg { get; set; }

    public string ActivityLevel { get; set; } = null!;

    public long? WorkoutsLast30Days { get; set; }

    public decimal? CaloriesThisWeek { get; set; }

    public long? ActiveGoals { get; set; }

    public decimal? LatestWeightKg { get; set; }

    public DateTime? LastMeasuredAt { get; set; }
}
