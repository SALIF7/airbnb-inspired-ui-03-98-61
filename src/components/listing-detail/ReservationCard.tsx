
import React, { useState } from "react";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import DateRangePicker from "@/components/shared/DateRangePicker";
import { useLanguage } from "@/hooks/language";
import { differenceInDays, parseISO } from "date-fns";

interface ReservationCardProps {
  price: string;
  averageRating: number;
  reviewCount: number;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  guestCount: number;
  setGuestCount: (count: number) => void;
  handleReservation: () => void;
  isFavorite: boolean;
  toggleFavorite: () => void;
  primaryColor: string;
}

const ReservationCard = ({
  price,
  averageRating,
  reviewCount,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  guestCount,
  setGuestCount,
  handleReservation,
  isFavorite,
  toggleFavorite,
  primaryColor,
}: ReservationCardProps) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculer la durée du séjour en jours
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return differenceInDays(end, start);
  };

  const days = calculateDays();
  const pricePerNight = parseInt(price.replace(/\s/g, ""));
  const totalPriceBeforeFees = days * pricePerNight || pricePerNight * 7;
  const serviceFee = Math.round(totalPriceBeforeFees * 0.12);
  const totalPrice = totalPriceBeforeFees + serviceFee;

  const handleSubmit = () => {
    setIsSubmitting(true);
    handleReservation();
    // Réinitialiser après un délai pour éviter les doubles clics
    setTimeout(() => {
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <Card className="border shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold">{price} FCFA</span>
            <span className="text-gray-600"> / {t('night')}</span>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="text-sm">
              {averageRating.toFixed(1)} · {reviewCount} {t('reviews')}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <DateRangePicker
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
        
        <Separator />
        
        <div className="p-3 border rounded-lg">
          <label className="block text-xs text-gray-500 mb-1">{t('travelers').toUpperCase()}</label>
          <select
            className="w-full focus:outline-none text-sm"
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} {t('traveler')}{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <Button
          className="w-full rounded-md"
          onClick={handleSubmit}
          style={{ backgroundColor: primaryColor }}
          disabled={isSubmitting || !startDate || !endDate}
        >
          {isSubmitting ? t('processing') : t('book')}
        </Button>

        <Button
          variant="outline"
          className="w-full flex items-center justify-center rounded-md"
          onClick={toggleFavorite}
        >
          <Heart
            className={`mr-2 h-4 w-4 ${
              isFavorite ? "fill-airbnb-red text-airbnb-red" : ""
            }`}
          />
          {isFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
        </Button>

        <div className="mt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">{price} FCFA x {days || 7} {t('nights')}</span>
            <span>{totalPriceBeforeFees.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('service_fee')}</span>
            <span>{serviceFee.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold pt-2">
            <span>{t('total')}</span>
            <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationCard;
