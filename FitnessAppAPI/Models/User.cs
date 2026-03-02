using System;
using System.Collections.Generic;

namespace FitnessAppAPI.Models;

public partial class User
{
    public Guid UserId { get; set; }

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public bool? IsActive { get; set; }

    public bool IsEmailVerified { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Bodymeasurement> Bodymeasurements { get; set; } = new List<Bodymeasurement>();

    public virtual ICollection<Goal> Goals { get; set; } = new List<Goal>();

    public virtual ICollection<Nutritionlog> Nutritionlogs { get; set; } = new List<Nutritionlog>();

    public virtual Userprofile? Userprofile { get; set; }

    public virtual ICollection<Workoutlog> Workoutlogs { get; set; } = new List<Workoutlog>();
}
