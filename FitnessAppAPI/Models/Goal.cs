using System;
using System.Collections.Generic;

namespace FitnessAppAPI.Models;

public partial class Goal
{
    public Guid GoalId { get; set; }

    public Guid UserId { get; set; }

    public string GoalType { get; set; } = null!;

    public string GoalName { get; set; } = null!;

    public decimal TargetValue { get; set; }

    public decimal CurrentValue { get; set; }

    public string Unit { get; set; } = null!;

    public DateTime StartDate { get; set; }

    public DateTime TargetDate { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
