from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [('product', '0010_remove_item_sales_alter_item_date_alter_item_id')]
    operations = [
        migrations.AddField(model_name='item', name='description', field=models.TextField(blank=True, default='')),
        migrations.AddField(model_name='item', name='materials_care', field=models.TextField(blank=True, default='')),
    ]
