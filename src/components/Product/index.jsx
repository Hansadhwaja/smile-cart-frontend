import { useEffect, useState } from "react";

import productsApi from "apis/products";
import {
  AddToCart,
  Header,
  PageNotFound,
  PageLoader,
} from "components/commons";
import useSelectedQuantity from "components/hooks/useSelectedQuantity";
import i18n from "i18next";
import { Button, Typography } from "neetoui";
import { append, isNotNil } from "ramda";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import routes from "routes";
import withTitle from "utils/withTitle";

import Carousel from "./Carousel";

const Product = () => {
  const { slug } = useParams();
  const { selectedQuantity, setSelectedQuantity } = useSelectedQuantity(slug);
  const [product, setProduct] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { t } = useTranslation();

  const fetchProduct = async () => {
    try {
      const product = await productsApi.show(slug);
      setProduct(product);
    } catch (error) {
      console.log(t("error.genericError", { error }));
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const {
    name,
    description,
    mrp,
    offerPrice,
    imageUrls,
    imageUrl,
    availableQuantity,
  } = product;
  const totalDiscounts = mrp - offerPrice;
  const discountPercentage = ((totalDiscounts / mrp) * 100).toFixed(1);

  if (isLoading) return <PageLoader />;

  if (isError) return <PageNotFound />;

  return (
    <>
      <Header title={name} />
      <div className="mt-6 flex gap-4">
        <div className="w-2/5">
          <div className="flex justify-center gap-16">
            {isNotNil(imageUrls) ? (
              <Carousel imageUrls={append(imageUrl, imageUrls)} title={name} />
            ) : (
              <img alt={name} className="w-48" src={imageUrl} />
            )}
          </div>
        </div>
        <div className="w-3/5 space-y-4">
          <Typography>{description}</Typography>
          <Typography>{t("mrp", { mrp })}</Typography>
          <Typography className="font-semibold">
            {t("offerPrice", { offerPrice })}
          </Typography>
          <Typography className="font-semibold text-green-600">
            {t("discountRate", { discountPercentage })}
          </Typography>
          <div className="flex space-x-10">
            <AddToCart {...{ availableQuantity, slug }} />
            <Button
              className="bg-neutral-800 hover:bg-neutral-950"
              label={t("buyNow")}
              size="large"
              to={routes.checkout}
              onClick={() => setSelectedQuantity(selectedQuantity || 1)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default withTitle(Product, i18n.t("product"));
