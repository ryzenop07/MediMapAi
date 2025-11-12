from django.db import models
from accounts.models import CustomUser


class Pharmacy(models.Model):
    """Pharmacy profile owned by a pharmacist user."""

    owner = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='pharmacy',
    )
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pharmacy_pharmacy'
        verbose_name_plural = 'pharmacies'

    def __str__(self):
        return self.name

    def to_dict(self):
        """Serialize pharmacy to dict (mimics the Mongoose document shape)."""
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'phone': self.phone,
            'latitude': self.latitude,
            'longitude': self.longitude,
            # Expose location in GeoJSON-compatible form for frontend compatibility
            'location': {
                'type': 'Point',
                'coordinates': [self.longitude, self.latitude]
                if self.longitude is not None and self.latitude is not None
                else [],
            },
            'inventory': [item.to_dict() for item in self.inventory.all()],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class InventoryItem(models.Model):
    """A single medicine entry in a pharmacy's inventory."""

    pharmacy = models.ForeignKey(
        Pharmacy,
        on_delete=models.CASCADE,
        related_name='inventory',
    )
    medicine = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'pharmacy_inventoryitem'
        unique_together = ('pharmacy', 'medicine')

    def __str__(self):
        return f"{self.medicine} ({self.quantity})"

    def to_dict(self):
        return {
            'medicine': self.medicine,
            'quantity': self.quantity,
            'price': float(self.price) if self.price is not None else None,
        }
