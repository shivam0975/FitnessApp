using System;
using System.Collections.Generic;

namespace FitnessAppAPI.Models;

public partial class Userprofile
{
    public Guid ProfileId { get; set; }

    public Guid UserId { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public DateTime DateOfBirth { get; set; }

    public string? Gender { get; set; }

    public decimal? HeightCm { get; set; }

    public decimal? CurrentWeightKg { get; set; }

    public decimal? TargetWeightKg { get; set; }

    public string ActivityLevel { get; set; } = null!;

    public string PreferredUnits { get; set; } = null!;

    public string? ProfilePicUrl { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
